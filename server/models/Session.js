const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  academicYear: { type: String, required: true },
  semester: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  locked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Session', SessionSchema);
