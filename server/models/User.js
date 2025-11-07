const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['student'], required: true },
  department: { type: String },
  regdNo: { type: String, index: true },
  percentage: { type: Number },
  cgpa: { type: Number },
  dob: { type: Date },
  preferences: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
