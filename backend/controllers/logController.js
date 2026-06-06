const prisma = require('../prismaClient');

// @desc    Get all activity logs with optional filtering
// @route   GET /api/logs
// @access  Private (Admin)
exports.getLogs = async (req, res) => {
  try {
    const { entityType, action, userId } = req.query;

    let whereClause = {};

    // Apply optional filters dynamically based on query params
    if (entityType) {
      if (entityType.includes(',')) {
        whereClause.entityType = { in: entityType.split(',') };
      } else {
        whereClause.entityType = entityType;
      }
    }
    if (action) {
      whereClause.action = action;
    }
    if (userId) {
      whereClause.performedById = userId;
    }

    const logs = await prisma.activityLog.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        performedBy: {
          select: {
            name: true,
            role: true,
          },
        },
      },
    });

    res.status(200).json(logs);
  } catch (error) {
    console.error('getLogs Error:', error);
    res.status(500).json({ error: 'Server error while fetching activity logs' });
  }
};