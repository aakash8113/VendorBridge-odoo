const prisma = require('../prismaClient');
const PDFDocument = require('pdfkit');
const { sendInvoiceEmail } = require('../utils/emailService');

// Helper wrapper for non-transactional single-activity logs
const logActivity = async (action, userId, entityType, entityId) => {
  try {
    await prisma.activityLog.create({
      data: { action, performedById: userId, entityType, entityId },
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

const generateInvoiceNumber = () => `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`;

// @desc    Generate an Invoice from a PO
// @route   POST /api/invoices/generate/:poId
// @access  Private (Admin, Manager, Procurement Officer)
exports.generateInvoice = async (req, res) => {
  try {
    const { poId } = req.params;

    // Extract PO along with the accepted Quotation to fetch exact GST percentage used
    const po = await prisma.purchaseOrder.findUnique({
      where: { id: poId },
      include: { quotation: true }
    });

    if (!po) return res.status(404).json({ error: 'Purchase Order not found' });

    // Validate invoice doesn't exist
    const existingInvoice = await prisma.invoice.findUnique({ where: { poId } });
    if (existingInvoice) return res.status(400).json({ error: 'Invoice was already generated for this PO' });

    // Tax Math Setup: Determine exact CGST and SGST splits derived from original quotation values
    const subtotal = po.quotation.subtotal;
    const totalGstPercentage = po.quotation.gstPercentage; // e.g., 18
    const splitGstPercentage = (totalGstPercentage / 2) / 100; // e.g., 0.09
    
    const cgst = subtotal * splitGstPercentage;
    const sgst = subtotal * splitGstPercentage;

    const issueDate = new Date();
    // Setting simple 30 day Payment Terms
    const dueDate = new Date();
    dueDate.setDate(issueDate.getDate() + 30); 

    const newInvoice = await prisma.invoice.create({
      data: {
        invoiceNumber: generateInvoiceNumber(),
        poId,
        vendorId: po.vendorId,
        issueDate,
        dueDate,
        cgst,
        sgst,
        grandTotal: po.totalAmount, // grandTotal from the PO/Quote
        status: 'PENDING_PAYMENT'
      }
    });

    // Optionally update PO Status
    await prisma.purchaseOrder.update({
      where: { id: poId },
      data: { status: 'SENT' } 
    });

    await logActivity('GENERATED_INVOICE', req.user.id, 'Invoice', newInvoice.id);
    
    res.status(201).json(newInvoice);

  } catch (error) {
    console.error('generateInvoice Error:', error);
    res.status(500).json({ error: 'Server error generating Invoice' });
  }
};

// @desc    Generate PDF dynamically for an Invoice
// @route   GET /api/documents/pdf/:invoiceId
// @access  Private (Admin, Manager, Procurement Officer, Vendor)
exports.generateInvoicePdf = async (req, res) => {
  try {
    const { invoiceId } = req.params;

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        vendor: true,
        purchaseOrder: {
          include: {
            rfq: true,
            quotation: {
              include: { quotationLineItems: true }
            }
          }
        }
      }
    });

    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    // Validate if Vendor is querying, they must own it
    if (req.user.role === 'VENDOR' && req.user.vendorId !== invoice.vendorId) {
      return res.status(403).json({ error: 'Access denied to download another vendor\'s invoice' });
    }

    // Initialize PDFKit
    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`);

    doc.pipe(res);

    // Build the simple PDF output
    doc.fontSize(22).text('INVOICE', { align: 'center' });
    doc.moveDown();
    
    // Core details
    doc.fontSize(12).text(`Invoice Number: ${invoice.invoiceNumber}`);
    doc.text(`Issue Date: ${invoice.issueDate.toDateString()}`);
    doc.text(`Due Date: ${invoice.dueDate.toDateString()}`);
    doc.moveDown();

    doc.text(`To Vendor: ${invoice.vendor.companyName}`);
    doc.text(`GST Number: ${invoice.vendor.gstNumber}`);
    doc.text(`Related PO: ${invoice.purchaseOrder.poNumber}`);
    doc.moveDown(2);

    doc.fontSize(16).text('Itemized Billing:', { underline: true });
    doc.moveDown();
    
    doc.fontSize(12);
    invoice.purchaseOrder.quotation.quotationLineItems.forEach(item => {
      doc.text(`- ${item.item}: $${item.unitPrice} = $${item.total}`);
    });
    doc.moveDown(2);

    // Totals Block
    doc.text(`Subtotal: $${invoice.purchaseOrder.quotation.subtotal.toFixed(2)}`, { align: 'right' });
    doc.text(`CGST: $${invoice.cgst.toFixed(2)}`, { align: 'right' });
    doc.text(`SGST: $${invoice.sgst.toFixed(2)}`, { align: 'right' });
    doc.moveDown();
    doc.fontSize(16).text(`Grand Total: $${invoice.grandTotal.toFixed(2)}`, { align: 'right', bold: true });

    // Finalize PDF rendering and close the response stream
    doc.end();

  } catch (error) {
    console.error('generateInvoicePdf Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Server error generating PDF package' });
    }
  }
};

// Helper: Generates a PDF buffer synchronously in memory for email attachments
const createInvoicePdfBuffer = (invoice) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      resolve(Buffer.concat(buffers));
    });
    doc.on('error', reject);

    // Build the simple PDF output
    doc.fontSize(22).text('INVOICE', { align: 'center' });
    doc.moveDown();
    
    // Core details
    doc.fontSize(12).text(`Invoice Number: ${invoice.invoiceNumber}`);
    doc.text(`Issue Date: ${invoice.issueDate.toDateString()}`);
    doc.text(`Due Date: ${invoice.dueDate.toDateString()}`);
    doc.moveDown();

    doc.text(`To Vendor: ${invoice.vendor.companyName}`);
    doc.text(`GST Number: ${invoice.vendor.gstNumber}`);
    doc.text(`Related PO: ${invoice.purchaseOrder.poNumber}`);
    doc.moveDown(2);

    doc.fontSize(16).text('Itemized Billing:', { underline: true });
    doc.moveDown();
    
    doc.fontSize(12);
    if (invoice.purchaseOrder?.quotation?.quotationLineItems) {
      invoice.purchaseOrder.quotation.quotationLineItems.forEach(item => {
        doc.text(`- ${item.item}: $${item.unitPrice} = $${item.total}`);
      });
    }
    doc.moveDown(2);

    const subtotal = invoice.purchaseOrder?.quotation?.subtotal || 0;
    // Totals Block
    doc.text(`Subtotal: $${subtotal.toFixed(2)}`, { align: 'right' });
    doc.text(`CGST: $${invoice.cgst.toFixed(2)}`, { align: 'right' });
    doc.text(`SGST: $${invoice.sgst.toFixed(2)}`, { align: 'right' });
    doc.moveDown();
    doc.fontSize(16).text(`Grand Total: $${invoice.grandTotal.toFixed(2)}`, { align: 'right', bold: true });

    doc.end();
  });
};

// @desc    Email PDF Invoice to Vendor
// @route   POST /api/invoices/:invoiceId/send
// @access  Private (Admin, Manager, Procurement Officer)
exports.sendInvoiceEmailRoute = async (req, res, next) => {
  try {
    const { invoiceId } = req.params;

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        vendor: true,
        purchaseOrder: {
          include: {
            rfq: true,
            quotation: {
              include: { quotationLineItems: true }
            }
          }
        }
      }
    });

    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    if (!invoice.vendor.contactEmail) return res.status(400).json({ error: 'Vendor has no contact email.' });

    // Generate the PDF into a memory buffer
    const pdfBuffer = await createInvoicePdfBuffer(invoice);

    // Call the Nodemailer Service
    await sendInvoiceEmail(invoice.vendor.contactEmail, pdfBuffer, invoice.invoiceNumber);

    // Activity Log
    await logActivity('EMAILED_INVOICE', req.user.id, 'Invoice', invoice.id);

    res.status(200).json({ success: true, message: 'Invoice emailed successfully.' });
  } catch (error) {
    next(error);
  }
};