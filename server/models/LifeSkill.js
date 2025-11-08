const mongoose = require("mongoose");

const lifeSkillSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true }, // Unique code for each life skill
  name: { type: String, required: true },              // Skill name
  capacity: { type: Number, required: true },          // Max number of students allowed
  minPercent: { type: Number, default: 0 },            // Minimum eligibility percentage (optional)
});

module.exports = mongoose.model("LifeSkill", lifeSkillSchema);
