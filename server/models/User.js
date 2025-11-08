const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // --- Authentication & Core Student Fields ---
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin', 'faculty'], default: 'student', required: true },
  department: { type: String },
  regdNo: { type: String, index: true },

  // --- Academic Performance Fields ---
  percentage: { type: Number },
  cgpa: { type: Number },
  dob: { type: Date },

  // =============================
  // ELECTIVE PREFERENCES SECTION
  // =============================
  preferences: [
    {
      rank: { type: Number, required: true },
      electiveId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Elective',
        required: true,
      },
    },
  ],

  allocatedElective: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Elective',
    default: null,
  },

  isConfirmed: { type: Boolean, default: false },

  completedElectives: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Elective',
    },
  ],

  lifeSkillPreferences: [
    {
      rank: { type: Number, required: true },
      lifeSkillId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LifeSkill',
        required: true,
      },
    },
  ],

  allocatedLifeSkill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LifeSkill',
    default: null,
  },

  isLifeSkillConfirmed: { type: Boolean, default: false },

  completedLifeSkills: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LifeSkill',
    },
  ],


  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);
