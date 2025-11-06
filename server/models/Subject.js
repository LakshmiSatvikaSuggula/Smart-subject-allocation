const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  capacity: { type: Number, required: true, default: 0 },
  filled: { type: Number, default: 0 },
  eligibility: { type: String },
  department: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Subject', SubjectSchema);
