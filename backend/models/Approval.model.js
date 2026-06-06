import mongoose from 'mongoose';

const approvalSchema = new mongoose.Schema({
  quotation: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation', required: true },
  rfq:       { type: mongoose.Schema.Types.ObjectId, ref: 'RFQ' },
  vendor:    { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  steps: [{
    approver:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role:      String,
    label:     String,
    status:    { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
    remarks:   String,
    actionAt:  Date,
  }],
  currentStep:   { type: Number, default: 0 },
  overallStatus: { type: String, enum: ['pending','l1_approved','l2_approved','approved','rejected'], default: 'pending' },
  amount:        Number,
  initiatedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

approvalSchema.index({ overallStatus: 1, initiatedBy: 1 });

export default mongoose.model('Approval', approvalSchema);
