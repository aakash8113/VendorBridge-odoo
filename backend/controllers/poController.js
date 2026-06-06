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
