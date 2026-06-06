import mongoose from 'mongoose';

const poSchema = new mongoose.Schema({
  poNumber:     { type: String, unique: true },
  rfq:          { type: mongoose.Schema.Types.ObjectId, ref: 'RFQ' },
  vendor:       { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  quotation:    { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation' },
  approval:     { type: mongoose.Schema.Types.ObjectId, ref: 'Approval' },
  lineItems:    [{ item: String, qty: Number, unitPrice: Number, total: Number }],
  subtotal:     Number,
  cgstAmount:   Number,
  sgstAmount:   Number,
  grandTotal:   Number,
  deliveryDate: Date,
  status:       { type: String, enum: ['draft','issued','delivered','cancelled'], default: 'issued' },
  issuedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  issuedAt:     { type: Date, default: Date.now },
  orgName:      String,
  orgAddress:   String,
  orgGst:       String,
}, { timestamps: true });

poSchema.index({ vendor: 1, status: 1 });

poSchema.pre('save', async function() {
  if (!this.poNumber) {
    const count = await mongoose.model('PurchaseOrder').countDocuments();
    this.poNumber = `PO-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
  }
});

export default mongoose.model('PurchaseOrder', poSchema);
