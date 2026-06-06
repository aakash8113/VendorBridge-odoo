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

// @desc    Get Monthly Spend Trend
// @route   GET /api/analytics/monthly-trend
// @access  Private (Admin, Manager)
exports.getMonthlyTrend = async (req, res) => {
  try {
    const purchaseOrders = await prisma.purchaseOrder.findMany({
      select: {
        totalAmount: true,
        poDate: true,
      },
    });

    const monthlyMap = purchaseOrders.reduce((acc, po) => {
      const date = new Date(po.poDate);
      const monthYear = date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      if (!acc[monthYear]) {
        acc[monthYear] = 0;
      }
      acc[monthYear] += po.totalAmount;
      return acc;
    }, {});

    const monthlyTrend = Object.keys(monthlyMap).map(month => ({
      name: month,
      value: monthlyMap[month],
    }));

    monthlyTrend.sort((a, b) => {
      const dateA = new Date(a.name);
      const dateB = new Date(b.name);
      return dateA - dateB;
    });

    res.status(200).json(monthlyTrend);
  } catch (error) {
    console.error('getMonthlyTrend Error:', error);
    res.status(500).json({ error: 'Server error while fetching monthly trend' });
  }
};

// @desc    Get Top Vendors by Spend
// @route   GET /api/analytics/top-vendors
// @access  Private (Admin, Manager)
exports.getTopVendors = async (req, res) => {
  try {
    const purchaseOrders = await prisma.purchaseOrder.findMany({
      select: {
        totalAmount: true,
        vendor: {
          select: {
            companyName: true,
          },
        },
      },
    });

    const vendorMap = purchaseOrders.reduce((acc, po) => {
      const name = po.vendor?.companyName || 'Unknown';
      if (!acc[name]) {
        acc[name] = { totalSpend: 0, poCount: 0 };
      }
      acc[name].totalSpend += po.totalAmount;
      acc[name].poCount += 1;
      return acc;
    }, {});

    const topVendors = Object.keys(vendorMap).map(name => ({
      name,
      spend: vendorMap[name].totalSpend,
      pos: vendorMap[name].poCount,
    }));

    topVendors.sort((a, b) => b.spend - a.spend);

    res.status(200).json(topVendors);
  } catch (error) {
    console.error('getTopVendors Error:', error);
    res.status(500).json({ error: 'Server error while fetching top vendors' });
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