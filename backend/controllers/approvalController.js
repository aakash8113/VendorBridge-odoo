const prisma = require('../prismaClient');

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

// @desc    Approve a quotation and generate a Purchase Order using constraints
// @route   PUT /api/quotations/:id/approve
// @access  Private (Manager, Admin)
exports.approveQuotation = async (req, res) => {
  try {
    const { id } = req.params;

    // First fetch the quotation to ensure it exists and get its data
    const quotation = await prisma.quotation.findUnique({
      where: { id },
    });

    if (!quotation) {
      return res.status(404).json({ error: 'Quotation not found' });
    }

    if (quotation.status !== 'SUBMITTED') {
      return res.status(400).json({ error: 'Only SUBMITTED quotations can be approved' });
    }

    const { rfqId, vendorId, grandTotal } = quotation;

    // Prisma Transaction ensures all or nothing executes across Quote, PO and RM entities
    const transactionResult = await prisma.$transaction(async (tx) => {
      
      // 1. Update intended Quotation to SELECTED
      const approvedQuote = await tx.quotation.update({
        where: { id },
        data: { status: 'SELECTED' }
      });

      // 2. Reject all OTHER quotations linked to the same RFQ
      await tx.quotation.updateMany({
        where: {
          rfqId,
          id: { not: id } // All except self
        },
        data: { status: 'REJECTED' }
      });

      // 3. Close the original RFQ so no further quotes can be submitted
      await tx.rFQ.update({
        where: { id: rfqId },
        data: { status: 'CLOSED' }
      });

      // 4. Generate the Purchase Order
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const poNumber = `PO-${new Date().getFullYear()}-${randomSuffix}`;
      
      const newPo = await tx.purchaseOrder.create({
        data: {
          poNumber,
          rfqId,
          vendorId,
          quotationId: id,
          poDate: new Date(),
          totalAmount: grandTotal,
          status: 'GENERATED'
        }
      });

      // 5. Log both the approval and the PO Generation
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
