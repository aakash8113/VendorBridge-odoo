const prisma = require('../prismaClient');

// Helper function to log activities
const logActivity = async (action, userId, entityType, entityId) => {
  try {
    await prisma.activityLog.create({
      data: { action, performedById: userId, entityType, entityId },
    });
  } catch (error) {
    console.error('Failed to insert ActivityLog:', error);
  }
};

// @desc    Get all vendors (with optional search)
// @route   GET /api/vendors
// @access  Private (Admin, Manager, Procurement Officer)
exports.getVendors = async (req, res) => {
  try {
    const { search } = req.query;
    let whereClause = {};

    if (search) {
      whereClause = {
        OR: [
          { companyName: { contains: search, mode: 'insensitive' } },
          { category: { contains: search, mode: 'insensitive' } },
          { contactEmail: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const vendors = await prisma.vendor.findMany({
      where: whereClause,
      orderBy: { companyName: 'asc' },
    });

    res.status(200).json(vendors);
  } catch (error) {
    console.error('getVendors Error:', error);
    res.status(500).json({ error: 'Server error while fetching vendors' });
  }
};

// @desc    Register a new vendor
// @route   POST /api/vendors
// @access  Private (Admin, Procurement Officer)
exports.createVendor = async (req, res) => {
  try {
    const {
      companyName,
      category,
      gstNumber,
      contactEmail,
      contactPhone,
      address,
      status, // Optional
    } = req.body;

    const existingVendor = await prisma.vendor.findUnique({
      where: { gstNumber },
    });

    if (existingVendor) {
      return res.status(400).json({ error: 'Vendor with this GST Number already exists' });
    }

    const newVendor = await prisma.vendor.create({
      data: {
        companyName,
        category,
        gstNumber,
        contactEmail,
        contactPhone,
        address,
        status: status || 'PENDING',
      },
    });

    if (req.user && req.user.id) {
      await logActivity('REGISTERED_VENDOR', req.user.id, 'Vendor', newVendor.id);
    }

    res.status(201).json(newVendor);
  } catch (error) {
    console.error('createVendor Error:', error);
    res.status(500).json({ error: 'Server error while creating vendor' });
  }
};

// @desc    Update vendor status
// @route   PUT /api/vendors/:id
// @access  Private (Admin)
exports.updateVendorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['ACTIVE', 'PENDING', 'BLOCKED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const updatedVendor = await prisma.vendor.update({
      where: { id },
      data: { status },
    });

    res.status(200).json(updatedVendor);
  } catch (error) {
    console.error('updateVendorStatus Error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    res.status(500).json({ error: 'Server error while updating vendor status' });
  }
};