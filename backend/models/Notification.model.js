import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:     String,
  message:   String,
  type:      { type: String, enum: ['rfq','approval','invoice','po','vendor','system'] },
  read:      { type: Boolean, default: false },
  link:      String,
}, { timestamps: true });

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
