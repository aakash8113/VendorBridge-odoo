import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  action:        { type: String, required: true },
  entity:        { type: String, enum: ['rfq','vendor','quotation','approval','po','invoice','user'] },
  entityId:      mongoose.Schema.Types.ObjectId,
  entityTitle:   String,
  performedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  meta:          mongoose.Schema.Types.Mixed,
}, { timestamps: true });

activityLogSchema.index({ entity: 1, performedBy: 1, createdAt: -1 });

export default mongoose.model('ActivityLog', activityLogSchema);
