import mongoose from 'mongoose';

const quotationSchema = new mongoose.Schema({
  rfq:          { type: mongoose.Schema.Types.ObjectId, ref: 'RFQ', required: true },
  vendor:       { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  items:        [{ item: String, qty: Number, unitPrice: Number, total: Number }],
  subtotal:     { type: Number, required: true },
  gstPercent:   { type: Number, default: 18 },
  gstAmount:    Number,
  grandTotal:   { type: Number, required: true },
  deliveryDays: Number,
  paymentTerms: String,
  notes:        String,
  status:       { type: String, enum: ['draft','submitted','selected','rejected'], default: 'draft' },
  submittedAt:  Date,
}, { timestamps: true });

quotationSchema.index({ rfq: 1, vendor: 1, status: 1 });
quotationSchema.index({ grandTotal: 1 });

export default mongoose.model('Quotation', quotationSchema);
