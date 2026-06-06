const prisma = require('../prismaClient');

// @desc    Get Key Performance Indicators (KPIs)
// @route   GET /api/analytics/kpis
// @access  Private (Admin, Manager)
exports.getKpis = async (req, res) => {
  try {
    // 1. Total Active RFQs (status = PUBLISHED)
    const activeRfqs = await prisma.rFQ.count({
      where: { status: 'PUBLISHED' },
    });

    // 2. Pending Approvals (Quotations with status = SUBMITTED)
    const pendingApprovals = await prisma.quotation.count({
      where: { status: 'SUBMITTED' },
    });

    // 3. Total Spend (Sum of all Purchase Orders)
    const totalSpendResult = await prisma.purchaseOrder.aggregate({
      _sum: { totalAmount: true },
    });
    const totalSpend = totalSpendResult._sum.totalAmount || 0;

    // 4. Total Active Vendors
    const activeVendors = await prisma.vendor.count({
      where: { status: 'ACTIVE' },
    });

    res.status(200).json({
      activeRfqs,
      pendingApprovals,
      totalSpend,
      activeVendors,
    });
  } catch (error) {
    console.error('getKpis Error:', error);
    res.status(500).json({ error: 'Server error while fetching KPIs' });
  }
};

// @desc    Get Total Spend Grouped By Category
// @route   GET /api/analytics/spend-by-category
// @access  Private (Admin, Manager)
exports.getSpendByCategory = async (req, res) => {
  try {
    // Since category lives on the RFQ model and spend lives on the PurchaseOrder model, 
    // and Prisma's groupBy doesn't fully support cross-model relation grouping yet, 
    // we fetch the mappings and aggregate them dynamically.
    const purchaseOrders = await prisma.purchaseOrder.findMany({
      select: {
        totalAmount: true,
        rfq: {
          select: {
            category: true,
          },
        },
      },
    });

    const categorySpendMap = purchaseOrders.reduce((acc, po) => {
      const category = po.rfq?.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += po.totalAmount;
      return acc;
    }, {});

    // Map dictionary cleanly to an array structure for frontend charts
    const spendByCategory = Object.keys(categorySpendMap).map(category => ({
      category,
      totalSpend: categorySpendMap[category],
    }));

    // Sort descending by highest spend
    spendByCategory.sort((a, b) => b.totalSpend - a.totalSpend);

    res.status(200).json(spendByCategory);
  } catch (error) {
    console.error('getSpendByCategory Error:', error);
    res.status(500).json({ error: 'Server error while fetching spend by category' });
  }
};