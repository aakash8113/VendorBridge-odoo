import mongoose from 'mongoose';

const rfqSchema = new mongoose.Schema({
  rfqNumber:       { type: String, unique: true },
  title:           { type: String, required: true },
  category:        { type: String, required: true },
  description:     String,
  lineItems:       [{ item: String, qty: Number, unit: String }],
  deadline:        { type: Date, required: true },
  status:          { type: String, enum: ['draft','published','closed','cancelled'], default: 'draft' },
  assignedVendors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' }],
  attachments:     [{ url: String, fileId: String, name: String }],
  quotationCount:  { type: Number, default: 0 },
  createdBy:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

rfqSchema.index({ status: 1, createdBy: 1, deadline: 1 });

rfqSchema.pre('save', async function() {
  if (!this.rfqNumber) {
    const count = await mongoose.model('RFQ').countDocuments();
    this.rfqNumber = `RFQ-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
  }
});

export default mongoose.model('RFQ', rfqSchema);
