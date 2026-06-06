const prisma = require('../prismaClient');

// @desc    Get all purchase orders
// @route   GET /api/pos
// @access  Private (Admin, Manager, Procurement Officer, Vendor)
exports.getPurchaseOrders = async (req, res) => {
  try {
    let whereClause = {};

    // If the user is a vendor, restrict to their own POs
    if (req.user.role === 'VENDOR') {
      if (!req.user.vendorId) {
        return res.status(403).json({ error: 'Vendor profile not linked to user account.' });
      }
      whereClause = { vendorId: req.user.vendorId };
    }

    const pos = await prisma.purchaseOrder.findMany({
      where: whereClause,
      include: {
        vendor: true,
        rfq: true,
        quotation: {
          include: { quotationLineItems: true }
        }
      },
      orderBy: { poDate: 'desc' }
    });

    res.status(200).json(pos);
  } catch (error) {
    console.error('getPurchaseOrders Error:', error);
    res.status(500).json({ error: 'Server error fetching purchase orders' });
  }
};

// @desc    Update purchase order status
// @route   PUT /api/pos/:id
// @access  Private (Admin, Manager)
exports.updatePoStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['GENERATED', 'SENT', 'FULFILLED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const updatedPo = await prisma.purchaseOrder.update({
      where: { id },
      data: { status },
    });

    res.status(200).json(updatedPo);
  } catch (error) {
    console.error('updatePoStatus Error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Purchase Order not found' });
    }
    res.status(500).json({ error: 'Server error while updating purchase order status' });
  }
};
