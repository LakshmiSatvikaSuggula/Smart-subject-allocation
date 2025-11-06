const mongoose = require('mongoose');

const AcademicSessionSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Sem1", "Sem2"
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: false }, // only one active at a time
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AcademicSession', AcademicSessionSchema);
