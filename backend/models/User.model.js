import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName:  { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true },
  password:  { type: String, select: false },
  role:      { type: String, enum: ['admin','officer','manager','vendor'], default: 'officer' },
  googleId:  { type: String, sparse: true },
  avatar:    { url: String, fileId: String },
  phone:     String,
  country:   String,
  additionalInfo: String,
  isVerified: { type: Boolean, default: false },
  isActive:   { type: Boolean, default: true },
}, { timestamps: true });

userSchema.pre('save', async function() {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function(plain) {
  return bcrypt.compare(plain, this.password);
};

export default mongoose.models.User || mongoose.model('User', userSchema);
