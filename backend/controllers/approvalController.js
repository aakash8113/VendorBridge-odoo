const prisma = require('../prismaClient');

// Utility to generate unique PO IDs
const generatePONumber = () => `PO-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

// Helper function to log activities inside a transaction
const logActivity = async (tx, action, userId, entityType, entityId) => {
  await tx.activityLog.create({
    data: {
      action,
      performedById: userId,
      entityType,
      entityId,
    },
  });
};

// @desc    Get pending quotations that need approval
// @route   GET /api/quotations/pending
// @access  Private (Manager, Admin)
exports.getPendingApprovals = async (req, res) => {
  try {
    const pendingQuotes = await prisma.quotation.findMany({
      where: { status: 'SUBMITTED' },
      include: {
        vendor: true,
        rfq: true,
        quotationLineItems: true
      },
      orderBy: { grandTotal: 'asc' }
    });
    res.status(200).json(pendingQuotes);
  } catch (error) {
    console.error('getPendingApprovals Error:', error);
    res.status(500).json({ error: 'Server error fetching pending approvals' });
  }
};

// @desc    Approve a quotation and generate a Purchase Order
// @route   PUT /api/quotations/:id/approve
// @access  Private (Manager, Admin)
exports.approveQuotation = async (req, res) => {
  try {
    const { id } = req.params;
    const { approvalRemarks } = req.body;

    const quotation = await prisma.quotation.findUnique({
      where: { id },
    });

    if (!quotation) return res.status(404).json({ error: 'Quotation not found' });
    if (quotation.status !== 'SUBMITTED') return res.status(400).json({ error: 'Only SUBMITTED quotations can be approved' });

    const { rfqId, vendorId, grandTotal } = quotation;

    const transactionResult = await prisma.$transaction(async (tx) => {
      // 1. Update intended Quotation with status and approval remarks
      const approvedQuote = await tx.quotation.update({
        where: { id },
        data: { 
          status: 'SELECTED',
          approvalRemarks: approvalRemarks || null,
        }
      });

      // 2. Reject all OTHER quotations linked to the same RFQ
      await tx.quotation.updateMany({
        where: { rfqId, id: { not: id } },
        data: { status: 'REJECTED' }
      });

      // 3. Close the original RFQ
      await tx.rFQ.update({
        where: { id: rfqId },
        data: { status: 'CLOSED' }
      });

      // 4. Generate the Purchase Order
      const newPo = await tx.purchaseOrder.create({
        data: {
          poNumber: generatePONumber(),
          rfqId,
          vendorId,
          quotationId: id,
          poDate: new Date(),
          totalAmount: grandTotal,
          status: 'GENERATED'
        }
      });

      // 5. Log actions
      await logActivity(tx, 'APPROVED_QUOTATION', req.user.id, 'Quotation', id);
      await logActivity(tx, 'GENERATED_PO', req.user.id, 'PurchaseOrder', newPo.id);

      return { approvedQuote, newPo };
    });

    res.status(200).json({
      message: 'Quotation successfully approved and PO Generated',
      purchaseOrder: transactionResult.newPo
    });

  } catch (error) {
    console.error('approveQuotation Error:', error);
    res.status(500).json({ error: 'Server error during approval workflow' });
  }
};

// @desc    Reject a quotation with remarks
// @route   PUT /api/quotations/:id/reject
// @access  Private (Manager, Admin)
exports.rejectQuotation = async (req, res) => {
  try {
    const { id } = req.params;
    const { approvalRemarks } = req.body;

    const quotation = await prisma.quotation.findUnique({ where: { id } });

    if (!quotation) return res.status(404).json({ error: 'Quotation not found' });
    if (quotation.status !== 'SUBMITTED') return res.status(400).json({ error: 'Only SUBMITTED quotations can be rejected' });

    const rejectedQuote = await prisma.quotation.update({
      where: { id },
      data: { 
        status: 'REJECTED',
        approvalRemarks: approvalRemarks || null,
      }
    });

    res.status(200).json({ message: 'Quotation rejected', quotation: rejectedQuote });
  } catch (error) {
    console.error('rejectQuotation Error:', error);
    res.status(500).json({ error: 'Server error during rejection workflow' });
  }
};
