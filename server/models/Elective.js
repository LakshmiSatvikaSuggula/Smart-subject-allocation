const mongoose = require("mongoose");

const electiveSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  capacity: { type: Number, required: true },
  minPercent: { type: Number, default: 0 },
});

module.exports = mongoose.model("Elective", electiveSchema);
