const prisma = require('../prismaClient');

// Helper function to log activities
const logActivity = async (action, userId, entityType, entityId) => {
  try {
    await prisma.activityLog.create({
      data: {
        action,
        performedById: userId,
        entityType,
        entityId,
      },
    });
  } catch (error) {
    console.error('Failed to insert ActivityLog:', error);
  }
};

// @desc    Submit a new Quotation
// @route   POST /api/quotations
// @access  Private (Vendor)
exports.createQuotation = async (req, res) => {
  try {
    const { rfqId, gstPercentage, deliveryDays, paymentTerms, lineItems } = req.body;

    const vendorId = req.user.vendorId;
    if (!vendorId) {
      return res.status(403).json({ error: 'Vendor profile not linked to user account.' });
    }

    // Validate the RFQ exists and the Vendor is assigned to it
    const rfq = await prisma.rFQ.findUnique({
      where: { id: rfqId },
      include: { assignedVendors: true }
    });

    if (!rfq) {
      return res.status(404).json({ error: 'RFQ not found.' });
    }

    const isAssigned = rfq.assignedVendors.some(v => v.id === vendorId);
    if (!isAssigned) {
      return res.status(403).json({ error: 'You are not assigned to this RFQ.' });
    }

    // Check if the vendor already submitted a quote
    const existingQuote = await prisma.quotation.findFirst({
      where: { rfqId, vendorId }
    });

    if (existingQuote) {
      return res.status(400).json({ error: 'You have already submitted a quotation for this RFQ.' });
    }

    // Calculate subtotal from lineItems (expecting { item, quantity, unitPrice })
    let subtotal = 0;
    const quotationLineItemsData = lineItems.map(li => {
      const lineTotal = li.unitPrice * (li.quantity || 1); // fallback to 1 if quantity not provided
      subtotal += lineTotal;
      return {
        item: li.item,
        unitPrice: li.unitPrice,
        total: lineTotal
      };
    });

    // Calculate grandTotal
    const grandTotal = subtotal + (subtotal * gstPercentage / 100);

    // Create the Quotation and its LineItems securely utilizing Prisma Nested Writes
    const newQuotation = await prisma.quotation.create({
      data: {
        rfqId,
        vendorId,
        subtotal,
        gstPercentage,
        grandTotal,
        deliveryDays,
        paymentTerms,
        status: 'SUBMITTED',
        quotationLineItems: {
          create: quotationLineItemsData
        }
      },
      include: {
        quotationLineItems: true
      }
    });

    // Log Activity
    await logActivity('SUBMITTED_QUOTATION', req.user.id, 'Quotation', newQuotation.id);

    res.status(201).json(newQuotation);
  } catch (error) {
    console.error('createQuotation Error:', error);
    res.status(500).json({ error: 'Server error while submitting quotation.' });
  }
};

// @desc    List all quotes submitted by the logged-in vendor
// @route   GET /api/quotations/vendor
// @access  Private (Vendor)
exports.getVendorQuotations = async (req, res) => {
  try {
    const vendorId = req.user.vendorId;
    if (!vendorId) {
      return res.status(403).json({ error: 'Vendor profile not linked to user account.' });
    }

    const quotations = await prisma.quotation.findMany({
      where: { vendorId },
      include: {
        rfq: {
          select: { title: true, deadline: true, status: true }
        },
        quotationLineItems: true
      },
      orderBy: { rfq: { deadline: 'desc' } }
    });

    res.status(200).json(quotations);
  } catch (error) {
    console.error('getVendorQuotations Error:', error);
    res.status(500).json({ error: 'Server error while fetching vendor quotations.' });
  }
};

// @desc    List all quotations (for admin/manager/procurement)
// @route   GET /api/quotations
// @access  Private (Admin, Manager, Procurement Officer)
exports.getAllQuotations = async (req, res) => {
  try {
    const quotations = await prisma.quotation.findMany({
      include: {
        vendor: {
          select: { companyName: true, contactEmail: true }
        },
        rfq: {
          select: { title: true, category: true, status: true }
        },
        quotationLineItems: true
      },
      orderBy: { grandTotal: 'desc' }
    });

    res.status(200).json(quotations);
  } catch (error) {
    console.error('getAllQuotations Error:', error);
    res.status(500).json({ error: 'Server error while fetching quotations.' });
  }
};

// @desc    Compare quotes for a specific RFQ
// @route   GET /api/quotations/compare/:rfqId
// @access  Private (Admin, Manager, Procurement Officer)
exports.compareQuotations = async (req, res) => {
  try {
    const { rfqId } = req.params;

    const quotations = await prisma.quotation.findMany({
      where: { rfqId },
      orderBy: { grandTotal: 'asc' }, // The lowest price is retrieved at index 0
      include: {
        vendor: {
          select: { id: true, companyName: true, rating: true, contactEmail: true }
        },
        quotationLineItems: true
      }
    });

    res.status(200).json(quotations);
  } catch (error) {
    console.error('compareQuotations Error:', error);
    res.status(500).json({ error: 'Server error while comparing quotations.' });
  }
};