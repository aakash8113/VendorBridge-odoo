import Approval from '../models/Approval.model.js';
import Quotation from '../models/Quotation.model.js';
import RFQ from '../models/RFQ.model.js';
import Vendor from '../models/Vendor.model.js';
import PurchaseOrder from '../models/PurchaseOrder.model.js';
import Invoice from '../models/Invoice.model.js';
import User from '../models/User.model.js';
import ActivityLog from '../models/ActivityLog.model.js';
import { createNotification } from '../services/notificationService.js';
import { generateInvoicePDF } from '../services/pdfService.js';
import { sendInvoiceEmail } from '../services/emailService.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listApprovals = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const parsedLimit = parseInt(limit, 10);

  const filters = {};
  if (status) {
    filters.overallStatus = status;
  }

  // Managers/Admins see approvals they need to process or overall approvals
  // Officers see approvals they initiated
  if (req.user.role === 'officer') {
    filters.initiatedBy = req.user._id;
  }

  const approvals = await Approval.find(filters)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parsedLimit)
    .populate('rfq', 'rfqNumber title category')
    .populate('vendor', 'companyName category gstNumber contactPerson')
    .populate('quotation', 'grandTotal items deliveryDays')
    .populate('initiatedBy', 'firstName lastName email');

  const total = await Approval.countDocuments(filters);

  return res.json(new ApiResponse(200, { approvals, total, page: parseInt(page, 10), limit: parsedLimit }, 'Approvals list fetched'));
});

export const getPendingApprovals = asyncHandler(async (req, res) => {
  const approvals = await Approval.find({ overallStatus: 'pending' })
    .populate('rfq', 'rfqNumber title category')
    .populate('vendor', 'companyName category')
    .populate('quotation', 'grandTotal items')
    .populate('initiatedBy', 'firstName lastName');

  return res.json(new ApiResponse(200, approvals, 'Pending approvals fetched'));
});

export const getApprovalDetail = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const approval = await Approval.findById(id)
    .populate('rfq', 'rfqNumber title category description deadline lineItems')
    .populate('vendor', 'companyName category gstNumber contactPerson phone email address')
    .populate('quotation', 'items subtotal gstPercent gstAmount grandTotal deliveryDays paymentTerms notes')
    .populate('initiatedBy', 'firstName lastName email')
    .populate('steps.approver', 'firstName lastName email role');

  if (!approval) {
    throw new ApiError(404, 'Approval workflow not found');
  }

  return res.json(new ApiResponse(200, approval, 'Approval details fetched'));
});

export const processApprovalAction = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, remarks } = req.body; // status: 'approved' or 'rejected'

  if (!['approved', 'rejected'].includes(status)) {
    throw new ApiError(400, 'Invalid status value');
  }

  const approval = await Approval.findById(id).populate('rfq').populate('vendor').populate('quotation');
  if (!approval) {
    throw new ApiError(404, 'Approval workflow not found');
  }

  if (approval.overallStatus === 'approved' || approval.overallStatus === 'rejected') {
    throw new ApiError(400, 'Approval workflow is already completed');
  }

  const currentStepIndex = approval.currentStep;
  const currentStep = approval.steps[currentStepIndex];

  if (!currentStep) {
    throw new ApiError(500, 'Invalid approval step index');
  }

  // Update step details
  currentStep.approver = req.user._id;
  currentStep.status = status;
  currentStep.remarks = remarks;
  currentStep.actionAt = new Date();

  if (status === 'rejected') {
    // End the approval workflow as rejected
    approval.overallStatus = 'rejected';
    
    // Reset quotation status to submitted
    const quote = await Quotation.findById(approval.quotation._id);
    if (quote) {
      quote.status = 'rejected';
      await quote.save();
    }

    await approval.save();

    // Notify initiator
    await createNotification({
      user: approval.initiatedBy,
      title: 'Quotation Approval Rejected',
      message: `Your procurement approval for RFQ: ${approval.rfq.title} (${approval.rfq.rfqNumber}) has been rejected at step ${currentStep.label} by ${req.user.firstName}. Remarks: ${remarks}`,
      type: 'approval',
      link: `/approvals/${approval._id}`
    });

    await ActivityLog.create({
      action: `APPROVAL_STEP_REJECTED`,
      entity: 'approval',
      entityId: approval._id,
      entityTitle: `${approval.rfq.rfqNumber} - ${approval.vendor.companyName}`,
      performedBy: req.user._id,
      meta: { remarks }
    });

    return res.json(new ApiResponse(200, approval, 'Approval workflow rejected'));
  }

  // If status is approved
  if (currentStepIndex === 0) {
    // Advance L1 to L2 Review
    approval.currentStep = 1;
    approval.overallStatus = 'l1_approved';
    await approval.save();

    // Notify Managers/Admins for L2 Review
    const managers = await User.find({ role: 'manager', isActive: true });
    for (const manager of managers) {
      if (manager._id.toString() !== req.user._id.toString()) {
        await createNotification({
          user: manager._id,
          title: 'RFQ Pending L2 Approval',
          message: `RFQ: ${approval.rfq.title} has passed L1 Review and is pending L2 Approval.`,
          type: 'approval',
          link: `/approvals/${approval._id}`
        });
      }
    }

    await ActivityLog.create({
      action: `APPROVAL_STEP_L1_APPROVED`,
      entity: 'approval',
      entityId: approval._id,
      entityTitle: `${approval.rfq.rfqNumber} - ${approval.vendor.companyName}`,
      performedBy: req.user._id,
      meta: { remarks }
    });

    return res.json(new ApiResponse(200, approval, 'L1 approved successfully, forwarded to L2'));
  }

  if (currentStepIndex === 1) {
    // Final L2 Approval -> Auto-generate PO & Invoice
    approval.overallStatus = 'approved';
    await approval.save();

    // 1. Generate Purchase Order
    const subtotal = approval.quotation.subtotal;
    const cgstAmount = subtotal * 0.09; // CGST 9%
    const sgstAmount = subtotal * 0.09; // SGST 9%
    const grandTotal = subtotal + cgstAmount + sgstAmount;

    // Delivery date calculation (now + deliveryDays)
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + (approval.quotation.deliveryDays || 14));

    const po = await PurchaseOrder.create({
      rfq: approval.rfq._id,
      vendor: approval.vendor._id,
      quotation: approval.quotation._id,
      approval: approval._id,
      lineItems: approval.quotation.items,
      subtotal,
      cgstAmount,
      sgstAmount,
      grandTotal,
      deliveryDate,
      status: 'issued',
      issuedBy: approval.initiatedBy,
      orgName: 'VendorBridge Procurement Ltd.',
      orgAddress: '456 Industrial Estate, Sector 12, Ahmedabad, Gujarat',
      orgGst: '24AAAAA1111A1Z1',
    });

    // Update vendor spend statistics
    const vendor = await Vendor.findById(approval.vendor._id);
    if (vendor) {
      vendor.totalOrders += 1;
      vendor.totalSpend += grandTotal;
      await vendor.save();
    }

    // 2. Generate Invoice
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30); // 30-day payment term

    const invoice = new Invoice({
      po: po._id,
      vendor: approval.vendor._id,
      lineItems: po.lineItems,
      subtotal,
      cgst: cgstAmount,
      sgst: sgstAmount,
      grandTotal,
      invoiceDate: new Date(),
      dueDate,
      status: 'pending_payment'
    });

    // Generate PDF and upload to ImageKit
    const { url: pdfUrl, fileId: pdfFileId, buffer: pdfBuffer } = await generateInvoicePDF(invoice, po, vendor);
    invoice.pdfUrl = pdfUrl;
    invoice.pdfFileId = pdfFileId;
    await invoice.save();

    // Notify Officer that PO is issued
    await createNotification({
      user: approval.initiatedBy,
      title: 'Purchase Order Issued',
      message: `Your Purchase Order ${po.poNumber} has been automatically generated after final approval of RFQ: ${approval.rfq.title}.`,
      type: 'po',
      link: `/purchase-orders/${po._id}`
    });

    // Notify Vendor about generated Invoice
    if (vendor.linkedUser) {
      await createNotification({
        user: vendor.linkedUser,
        title: 'Invoice Generated',
        message: `An invoice (${invoice.invoiceNumber}) has been generated for Purchase Order ${po.poNumber}. Total: ₹${grandTotal.toLocaleString('en-IN')}`,
        type: 'invoice',
        link: `/invoices/${invoice._id}`
      });
    }

    // Email Invoice PDF to Vendor
    try {
      await sendInvoiceEmail(vendor.email, invoice, pdfBuffer, `${invoice.invoiceNumber}.pdf`);
      invoice.sentAt = new Date();
      await invoice.save();
    } catch (emailError) {
      console.error('Error emailing invoice:', emailError.message);
    }

    await ActivityLog.create({
      action: `APPROVAL_FINAL_APPROVED`,
      entity: 'approval',
      entityId: approval._id,
      entityTitle: `${approval.rfq.rfqNumber} - ${approval.vendor.companyName}`,
      performedBy: req.user._id,
      meta: { poId: po._id, invoiceId: invoice._id, remarks }
    });

    return res.json(new ApiResponse(200, { approval, po, invoice }, 'Final approval completed. PO and Invoice generated.'));
  }
});
