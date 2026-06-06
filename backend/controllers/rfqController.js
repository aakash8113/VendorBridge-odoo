import RFQ from '../models/RFQ.model.js';
import Vendor from '../models/Vendor.model.js';
import Quotation from '../models/Quotation.model.js';
import ActivityLog from '../models/ActivityLog.model.js';
import { createNotification } from '../services/notificationService.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listRfqs = asyncHandler(async (req, res) => {
  const { category, status, page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const parsedLimit = parseInt(limit, 10);

  const filters = {};

  if (status) {
    filters.status = status;
  }
  if (category) {
    filters.category = category;
  }

  // Role filtering logic: Vendors only see published RFQs assigned to them
  if (req.user.role === 'vendor') {
    const vendor = await Vendor.findOne({ linkedUser: req.user._id, isDeleted: { $ne: true } });
    if (!vendor) {
      return res.json(new ApiResponse(200, { rfqs: [], total: 0, page: parseInt(page, 10), limit: parsedLimit }, 'Vendor profile not found'));
    }
    filters.status = 'published';
    filters.assignedVendors = vendor._id;
  }

  const rfqs = await RFQ.find(filters)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parsedLimit)
    .populate('assignedVendors', 'companyName category gstNumber contactPerson phone email');

  const total = await RFQ.countDocuments(filters);

  return res.json(new ApiResponse(200, { rfqs, total, page: parseInt(page, 10), limit: parsedLimit }, 'RFQs list fetched'));
});

export const createRfq = asyncHandler(async (req, res) => {
  const { title, category, description, lineItems, deadline, assignedVendors, attachments } = req.body;

  // Validate deadline is in the future
  if (new Date(deadline) <= new Date()) {
    throw new ApiError(400, 'Deadline must be a future date');
  }

  const rfq = await RFQ.create({
    title,
    category,
    description,
    lineItems, // [{ item, qty, unit }]
    deadline,
    assignedVendors,
    attachments,
    createdBy: req.user._id,
  });

  await ActivityLog.create({
    action: 'RFQ_CREATED',
    entity: 'rfq',
    entityId: rfq._id,
    entityTitle: rfq.title,
    performedBy: req.user._id,
  });

  return res.status(201).json(new ApiResponse(201, rfq, 'RFQ created successfully as draft'));
});

export const getRfqDetail = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const rfq = await RFQ.findById(id).populate('assignedVendors', 'companyName category contactPerson phone email');
  if (!rfq) {
    throw new ApiError(404, 'RFQ not found');
  }

  // Security: Vendor can only view their own assigned RFQs that are published
  if (req.user.role === 'vendor') {
    const vendor = await Vendor.findOne({ linkedUser: req.user._id, isDeleted: { $ne: true } });
    if (!vendor || !rfq.assignedVendors.some(v => v._id.toString() === vendor._id.toString()) || rfq.status === 'draft') {
      throw new ApiError(403, 'Forbidden: You do not have permission to access this RFQ');
    }
  }

  // Get quotations for this RFQ
  let quotations = [];
  if (req.user.role === 'vendor') {
    // Vendor only sees their own quotation
    const vendor = await Vendor.findOne({ linkedUser: req.user._id, isDeleted: { $ne: true } });
    if (vendor) {
      quotations = await Quotation.find({ rfq: id, vendor: vendor._id }).populate('vendor', 'companyName');
    }
  } else {
    // Admin/Officer/Manager sees all quotations
    quotations = await Quotation.find({ rfq: id }).populate('vendor', 'companyName rating contactPerson phone email');
  }

  return res.json(new ApiResponse(200, { rfq, quotations }, 'RFQ detail fetched'));
});

export const updateRfq = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, category, description, lineItems, deadline, assignedVendors, attachments } = req.body;

  const rfq = await RFQ.findById(id);
  if (!rfq) {
    throw new ApiError(404, 'RFQ not found');
  }

  if (rfq.status !== 'draft') {
    throw new ApiError(400, 'Cannot edit an RFQ that is already published, closed, or cancelled');
  }

  if (deadline && new Date(deadline) <= new Date()) {
    throw new ApiError(400, 'Deadline must be a future date');
  }

  if (title) rfq.title = title;
  if (category) rfq.category = category;
  if (description) rfq.description = description;
  if (lineItems) rfq.lineItems = lineItems;
  if (deadline) rfq.deadline = deadline;
  if (assignedVendors) rfq.assignedVendors = assignedVendors;
  if (attachments) rfq.attachments = attachments;

  await rfq.save();

  await ActivityLog.create({
    action: 'RFQ_UPDATED',
    entity: 'rfq',
    entityId: rfq._id,
    entityTitle: rfq.title,
    performedBy: req.user._id,
  });

  return res.json(new ApiResponse(200, rfq, 'RFQ updated successfully'));
});

export const publishRfq = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const rfq = await RFQ.findById(id);
  if (!rfq) {
    throw new ApiError(404, 'RFQ not found');
  }

  if (rfq.status !== 'draft') {
    throw new ApiError(400, 'Only draft RFQs can be published');
  }

  rfq.status = 'published';
  await rfq.save();

  await ActivityLog.create({
    action: 'RFQ_PUBLISHED',
    entity: 'rfq',
    entityId: rfq._id,
    entityTitle: rfq.title,
    performedBy: req.user._id,
  });

  // Notify assigned vendors
  const vendors = await Vendor.find({ _id: { $in: rfq.assignedVendors }, isDeleted: { $ne: true } }).populate('linkedUser');
  
  for (const vendor of vendors) {
    if (vendor.linkedUser) {
      await createNotification({
        user: vendor.linkedUser._id,
        title: 'New RFQ Published',
        message: `You have been assigned a new RFQ: ${rfq.title} (${rfq.rfqNumber}). Deadline: ${new Date(rfq.deadline).toLocaleDateString('en-IN')}`,
        type: 'rfq',
        link: `/rfqs/${rfq._id}`
      });
    }
  }

  return res.json(new ApiResponse(200, rfq, 'RFQ published and vendors notified'));
});

export const closeRfq = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const rfq = await RFQ.findById(id);
  if (!rfq) {
    throw new ApiError(404, 'RFQ not found');
  }

  if (rfq.status !== 'published') {
    throw new ApiError(400, 'Only published RFQs can be closed');
  }

  rfq.status = 'closed';
  await rfq.save();

  await ActivityLog.create({
    action: 'RFQ_CLOSED',
    entity: 'rfq',
    entityId: rfq._id,
    entityTitle: rfq.title,
    performedBy: req.user._id,
  });

  return res.json(new ApiResponse(200, rfq, 'RFQ closed successfully'));
});

export const cancelRfq = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const rfq = await RFQ.findById(id);
  if (!rfq) {
    throw new ApiError(404, 'RFQ not found');
  }

  if (rfq.status !== 'draft') {
    throw new ApiError(400, 'Only draft RFQs can be cancelled/deleted');
  }

  rfq.status = 'cancelled';
  await rfq.save();

  await ActivityLog.create({
    action: 'RFQ_CANCELLED',
    entity: 'rfq',
    entityId: rfq._id,
    entityTitle: rfq.title,
    performedBy: req.user._id,
  });

  return res.json(new ApiResponse(200, rfq, 'RFQ cancelled successfully'));
});
