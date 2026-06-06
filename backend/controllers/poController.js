import PurchaseOrder from '../models/PurchaseOrder.model.js';
import Vendor from '../models/Vendor.model.js';
import ActivityLog from '../models/ActivityLog.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listPurchaseOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const parsedLimit = parseInt(limit, 10);

  const filters = {};
  if (status) {
    filters.status = status;
  }

  // Vendors can only see their own purchase orders
  if (req.user.role === 'vendor') {
    const vendor = await Vendor.findOne({ linkedUser: req.user._id, isDeleted: { $ne: true } });
    if (!vendor) {
      return res.json(new ApiResponse(200, { pos: [], total: 0, page: parseInt(page, 10), limit: parsedLimit }, 'Vendor profile not found'));
    }
    filters.vendor = vendor._id;
  }

  const pos = await PurchaseOrder.find(filters)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parsedLimit)
    .populate('rfq', 'rfqNumber title category')
    .populate('vendor', 'companyName category gstNumber contactPerson phone')
    .populate('issuedBy', 'firstName lastName');

  const total = await PurchaseOrder.countDocuments(filters);

  return res.json(new ApiResponse(200, { pos, total, page: parseInt(page, 10), limit: parsedLimit }, 'Purchase Orders list fetched'));
});

export const getPurchaseOrderDetail = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const po = await PurchaseOrder.findById(id)
    .populate('rfq', 'rfqNumber title category description deadline lineItems')
    .populate('vendor', 'companyName category gstNumber contactPerson phone email address')
    .populate('issuedBy', 'firstName lastName email');

  if (!po) {
    throw new ApiError(404, 'Purchase Order not found');
  }

  // Security check for vendors
  if (req.user.role === 'vendor') {
    const vendor = await Vendor.findOne({ linkedUser: req.user._id, isDeleted: { $ne: true } });
    if (!vendor || po.vendor._id.toString() !== vendor._id.toString()) {
      throw new ApiError(403, 'Forbidden: You cannot access this Purchase Order');
    }
  }

  return res.json(new ApiResponse(200, po, 'Purchase Order details fetched'));
});

export const changePoStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['issued', 'delivered', 'cancelled'].includes(status)) {
    throw new ApiError(400, 'Invalid status value');
  }

  const po = await PurchaseOrder.findById(id).populate('vendor');
  if (!po) {
    throw new ApiError(404, 'Purchase Order not found');
  }

  po.status = status;
  await po.save();

  await ActivityLog.create({
    action: `PO_STATUS_${status.toUpperCase()}`,
    entity: 'po',
    entityId: po._id,
    entityTitle: `${po.poNumber} - ${po.vendor.companyName}`,
    performedBy: req.user._id,
    meta: { status }
  });

  return res.json(new ApiResponse(200, po, `Purchase Order status updated to ${status}`));
});
