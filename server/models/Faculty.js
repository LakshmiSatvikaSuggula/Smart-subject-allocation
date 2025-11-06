const mongoose = require('mongoose');

const FacultySchema = new mongoose.Schema({
  regdNo: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Faculty', FacultySchema);
