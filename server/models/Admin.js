const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  regdNo: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true }, // hashed password
   role: { type: String, default: 'admin' }
});

module.exports = mongoose.model("Admin", adminSchema);
