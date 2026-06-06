import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema({
  companyName:   { type: String, required: true, trim: true },
  category:      { type: String, required: true },
  gstNumber:     { type: String, required: true, uppercase: true },
  contactPerson: { type: String, required: true },
  email:         { type: String, required: true, unique: true, lowercase: true },
  phone:         { type: String, required: true },
  country:       String,
  address:       String,
  status:        { type: String, enum: ['active','pending','blocked'], default: 'pending' },
  logo:          { url: String, fileId: String },
  documents:     [{ url: String, fileId: String, name: String }],
  rating:        { type: Number, default: 0, min: 0, max: 5 },
  totalOrders:   { type: Number, default: 0 },
  totalSpend:    { type: Number, default: 0 },
  linkedUser:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

vendorSchema.index({ status: 1, category: 1 });
vendorSchema.index({ gstNumber: 1 }, { unique: true });
vendorSchema.index({ companyName: 'text', gstNumber: 'text' });

export default mongoose.model('Vendor', vendorSchema);
