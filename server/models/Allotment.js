const mongoose = require('mongoose');

const AllotmentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  subjectCode: { type: String, required: true, index: true },
  preferenceRank: { type: Number },
  status: { type: String, enum: ['allocated','unassigned','pending'], default: 'pending' },
  allocatedAt: { type: Date }
});

module.exports = mongoose.model('Allotment', AllotmentSchema);
