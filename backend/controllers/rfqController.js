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

// @desc    Create a new RFQ
// @route   POST /api/rfqs
// @access  Private (Procurement Officer)
exports.createRfq = async (req, res, next) => {
  try {
    let { title, description, category, deadline, status, lineItems, vendorIds } = req.body;

    // Because the payload might be sent as multipart/form-data due to the file,
    // arrays/objects might arrive as stringified JSON.
    if (typeof lineItems === 'string') lineItems = JSON.parse(lineItems);
    if (typeof vendorIds === 'string') vendorIds = JSON.parse(vendorIds);

    // Grab file from multer if available
    const attachmentUrl = req.file ? `/uploads/${req.file.filename}` : null;

    // Build the nested write query for line items
    // lineItems format expected: [{ item: 'Drill', quantity: 50, unit: 'pcs' }, ...]
    let lineItemsData = [];
    if (lineItems && lineItems.length > 0) {
      lineItemsData = lineItems.map(li => ({
        item: li.item,
        quantity: parseInt(li.quantity),
        unit: li.unit,
      }));
    }

    // Connect to assigned vendors
    let assignedVendorsData = undefined;
    if (vendorIds && vendorIds.length > 0) {
      assignedVendorsData = {
        connect: vendorIds.map(id => ({ id })),
      };
    }

    // Transactional nested write using Prisma
    const newRfq = await prisma.rFQ.create({
      data: {
        title,
        description,
        category,
        deadline: new Date(deadline),
        status: status || 'DRAFT',
        attachmentUrl,
        createdById: req.user.id,
        lineItems: {
          create: lineItemsData,
        },
        assignedVendors: assignedVendorsData,
      },
      include: {
        lineItems: true,
        assignedVendors: true,
      },
    });

    // Log Activity
    await logActivity('CREATED_RFQ', req.user.id, 'RFQ', newRfq.id);

    res.status(201).json({ success: true, data: newRfq });
  } catch (error) {
    next(error); // Pass to global error handler
  }
};

// @desc    List RFQs
// @route   GET /api/rfqs
// @access  Private (Admin, Manager, Procurement Officer, Vendor)
exports.getRfqs = async (req, res) => {
  try {
    let whereClause = {};

    // If the user is a VENDOR, they can only see RFQs they are assigned to
    if (req.user.role === 'VENDOR') {
      if (!req.user.vendorId) {
        return res.status(403).json({ error: 'Vendor profile not linked to user account.' });
      }
      whereClause = {
        assignedVendors: {
          some: {
            id: req.user.vendorId,
          },
        },
        // Typically a vendor should only see published or closed RFQs, not drafts,
        // but adding based purely on instructions
      };
    }

    const rfqs = await prisma.rFQ.findMany({
      where: whereClause,
      include: {
        lineItems: true,
        assignedVendors: {
          select: {
            id: true,
            companyName: true,
            contactEmail: true,
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: { deadline: 'asc' }
    });

    res.status(200).json(rfqs);
  } catch (error) {
    console.error('getRfqs Error:', error);
    res.status(500).json({ error: 'Server error while fetching RFQs' });
  }
};

// @desc    Get RFQ by ID
// @route   GET /api/rfqs/:id
// @access  Private (Admin, Manager, Procurement Officer, Vendor)
exports.getRfqById = async (req, res) => {
  try {
    const { id } = req.params;

    const rfq = await prisma.rFQ.findUnique({
      where: { id },
      include: {
        lineItems: true,
        assignedVendors: true,
        createdBy: {
          select: {
            name: true,
            email: true,
          }
        }
      },
    });

    if (!rfq) {
      return res.status(404).json({ error: 'RFQ not found' });
    }

    // Additional check: if user is vendor, verify they are assigned
    if (req.user.role === 'VENDOR') {
      const isAssigned = rfq.assignedVendors.some(v => v.id === req.user.vendorId);
      if (!isAssigned) {
        return res.status(403).json({ error: 'You are not assigned to this RFQ' });
      }
    }

    res.status(200).json(rfq);
  } catch (error) {
    console.error('getRfqById Error:', error);
    res.status(500).json({ error: 'Server error while fetching RFQ details' });
  }
};