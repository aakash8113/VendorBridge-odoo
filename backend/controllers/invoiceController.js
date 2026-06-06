const prisma = require('../prismaClient');

// @desc    Get all invoices
// @route   GET /api/invoices
// @access  Private (Admin, Manager, Procurement Officer, Vendor)
exports.getInvoices = async (req, res) => {
  try {
    let whereClause = {};

    // If the user is a vendor, restrict to their own invoices
    if (req.user.role === 'VENDOR') {
      if (!req.user.vendorId) {
        return res.status(403).json({ error: 'Vendor profile not linked to user account.' });
      }
      whereClause = { vendorId: req.user.vendorId };
    }

    const invoices = await prisma.invoice.findMany({
      where: whereClause,
      include: {
        vendor: {
          select: {
            id: true,
            companyName: true,
            gstNumber: true,
            contactEmail: true,
          }
        },
        purchaseOrder: {
          select: {
            poNumber: true,
            totalAmount: true,
            status: true,
          }
        }
      },
      orderBy: { issueDate: 'desc' }
    });

    res.status(200).json(invoices);
  } catch (error) {
    console.error('getInvoices Error:', error);
    res.status(500).json({ error: 'Server error while fetching invoices' });
  }
};

// @desc    Update invoice status (mark as PAID)
// @route   PUT /api/invoices/:id
// @access  Private (Admin, Manager)
exports.updateInvoiceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['PENDING_PAYMENT', 'PAID', 'OVERDUE'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: { status },
    });

    res.status(200).json(updatedInvoice);
  } catch (error) {
    console.error('updateInvoiceStatus Error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    res.status(500).json({ error: 'Server error while updating invoice status' });
  }
};