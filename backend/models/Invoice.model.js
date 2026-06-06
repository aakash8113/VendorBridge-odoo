import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, unique: true },
  po:            { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseOrder', unique: true },
  vendor:        { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  lineItems:     [{ item: String, qty: Number, unitPrice: Number, total: Number }],
  subtotal:      Number,
  cgst:          Number,
  sgst:          Number,
  grandTotal:    Number,
  invoiceDate:   { type: Date, default: Date.now },
  dueDate:       Date,
  status:        { type: String, enum: ['pending_payment','paid','overdue'], default: 'pending_payment' },
  pdfUrl:        String,
  pdfFileId:     String,
  sentAt:        Date,
  paidAt:        Date,
}, { timestamps: true });

invoiceSchema.index({ status: 1 });

invoiceSchema.pre('save', async function() {
  if (!this.invoiceNumber) {
    const count = await mongoose.model('Invoice').countDocuments();
    this.invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
  }
});

export default mongoose.model('Invoice', invoiceSchema);
