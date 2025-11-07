const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  regdNo: { type: String, required: true, unique: true }, // can be faculty ID
  passwordHash: { type: String, required: true },
  role: { type: String, default: 'faculty' }
});

module.exports = mongoose.model('Faculty', facultySchema);
