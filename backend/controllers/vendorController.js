import Vendor from '../models/Vendor.model.js';
import User from '../models/User.model.js';
import RFQ from '../models/RFQ.model.js';
import ActivityLog from '../models/ActivityLog.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import mongoose from 'mongoose';

export const listVendors = asyncHandler(async (req, res) => {
  const { search, category, status, page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const parsedLimit = parseInt(limit, 10);

  const filters = { isDeleted: { $ne: true } };

  if (status) {
    filters.status = status;
  }
  if (category) {
    filters.category = category;
  }
  if (search) {
    filters.$or = [
      { companyName: { $regex: search, $options: 'i' } },
      { gstNumber: { $regex: search, $options: 'i' } },
      { contactPerson: { $regex: search, $options: 'i' } }
    ];
  }

  // Aggregation pipeline matching problem statement exactly
  const vendors = await Vendor.aggregate([
    { $match: filters },
    { $lookup: { from: 'purchaseorders', localField: '_id', foreignField: 'vendor', as: 'pos' } },
    { $lookup: { from: 'quotations', localField: '_id', foreignField: 'vendor', as: 'quotes' } },
    { $addFields: {
      totalOrders: { $size: '$pos' },
      totalSpend:  { $sum: '$pos.grandTotal' },
      quotesCount: { $size: '$quotes' }
    }},
    { $project: { pos: 0, quotes: 0 } },
    { $skip: skip },
    { $limit: parsedLimit }
  ]);

  const total = await Vendor.countDocuments(filters);

  return res.json(new ApiResponse(200, { vendors, total, page: parseInt(page, 10), limit: parsedLimit }, 'Vendors list fetched'));
});

export const createVendor = asyncHandler(async (req, res) => {
  const { companyName, category, gstNumber, contactPerson, email, phone, country, address, logo, documents, linkedUserEmail } = req.body;

  // Verify uniqueness of GST
  const existingGst = await Vendor.findOne({ gstNumber, isDeleted: { $ne: true } });
  if (existingGst) {
    throw new ApiError(400, 'GST number is already registered');
  }

  const existingEmail = await Vendor.findOne({ email, isDeleted: { $ne: true } });
  if (existingEmail) {
    throw new ApiError(400, 'Vendor email is already registered');
  }

  let linkedUser = null;
  if (linkedUserEmail) {
    const user = await User.findOne({ email: linkedUserEmail.toLowerCase() });
    if (user) {
      linkedUser = user._id;
      user.role = 'vendor';
      await user.save();
    }
  }

  const vendor = await Vendor.create({
    companyName,
    category,
    gstNumber,
    contactPerson,
    email,
    phone,
    country,
    address,
    logo, // { url, fileId }
    documents, // [{ url, fileId, name }]
    linkedUser,
    createdBy: req.user._id,
  });

  await ActivityLog.create({
    action: 'VENDOR_CREATED',
    entity: 'vendor',
    entityId: vendor._id,
    entityTitle: companyName,
    performedBy: req.user._id,
  });

  return res.status(201).json(new ApiResponse(201, vendor, 'Vendor profile created successfully'));
});

export const getVendorDetail = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const vendor = await Vendor.findOne({ _id: id, isDeleted: { $ne: true } }).populate('linkedUser', 'firstName lastName email avatar');
  if (!vendor) {
    throw new ApiError(404, 'Vendor not found');
  }

  // Calculate quick stats separately
  const stats = await Vendor.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(id) } },
    { $lookup: { from: 'purchaseorders', localField: '_id', foreignField: 'vendor', as: 'pos' } },
    { $addFields: {
      totalOrders: { $size: '$pos' },
      totalSpend:  { $sum: '$pos.grandTotal' }
    }},
    { $project: { totalOrders: 1, totalSpend: 1 } }
  ]);

  return res.json(new ApiResponse(200, { vendor, stats: stats[0] || { totalOrders: 0, totalSpend: 0 } }, 'Vendor details fetched'));
});

export const updateVendor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { companyName, category, gstNumber, contactPerson, phone, country, address, logo, documents } = req.body;

  const vendor = await Vendor.findOne({ _id: id, isDeleted: { $ne: true } });
  if (!vendor) {
    throw new ApiError(404, 'Vendor not found');
  }

  if (gstNumber && gstNumber !== vendor.gstNumber) {
    const existingGst = await Vendor.findOne({ gstNumber, _id: { $ne: id }, isDeleted: { $ne: true } });
    if (existingGst) {
      throw new ApiError(400, 'GST number is already in use by another vendor');
    }
    vendor.gstNumber = gstNumber;
  }

  if (companyName) vendor.companyName = companyName;
  if (category) vendor.category = category;
  if (contactPerson) vendor.contactPerson = contactPerson;
  if (phone) vendor.phone = phone;
  if (country) vendor.country = country;
  if (address) vendor.address = address;
  if (logo) vendor.logo = logo;
  if (documents) vendor.documents = documents;

  await vendor.save();

  await ActivityLog.create({
    action: 'VENDOR_UPDATED',
    entity: 'vendor',
    entityId: vendor._id,
    entityTitle: vendor.companyName,
    performedBy: req.user._id,
  });

  return res.json(new ApiResponse(200, vendor, 'Vendor profile updated successfully'));
});

export const changeVendorStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['active', 'pending', 'blocked'].includes(status)) {
    throw new ApiError(400, 'Invalid status value');
  }

  const vendor = await Vendor.findOne({ _id: id, isDeleted: { $ne: true } });
  if (!vendor) {
    throw new ApiError(404, 'Vendor not found');
  }

  vendor.status = status;
  await vendor.save();

  await ActivityLog.create({
    action: `VENDOR_STATUS_${status.toUpperCase()}`,
    entity: 'vendor',
    entityId: vendor._id,
    entityTitle: vendor.companyName,
    performedBy: req.user._id,
    meta: { status }
  });

  return res.json(new ApiResponse(200, vendor, `Vendor status updated to ${status}`));
});

export const deleteVendor = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const vendor = await Vendor.findOne({ _id: id, isDeleted: { $ne: true } });
  if (!vendor) {
    throw new ApiError(404, 'Vendor not found');
  }

  vendor.isDeleted = true;
  await vendor.save();

  await ActivityLog.create({
    action: 'VENDOR_DELETED',
    entity: 'vendor',
    entityId: vendor._id,
    entityTitle: vendor.companyName,
    performedBy: req.user._id,
  });

  return res.json(new ApiResponse(200, {}, 'Vendor soft deleted successfully'));
});

export const getVendorRfqs = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const rfqs = await RFQ.find({ assignedVendors: id, status: { $ne: 'draft' } }).sort({ createdAt: -1 });
  return res.json(new ApiResponse(200, rfqs, 'Vendor RFQs fetched'));
});
