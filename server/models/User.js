const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['student'], required: true },
  department: { type: String },
  regdNo: { type: String, index: true },
  percentage: { type: Number },
  cgpa: { type: Number },
  dob: { type: Date },
    preferences: [{
        rank: {
            type: Number, // Expecting the rank to be a number (1, 2, 3...)
            required: true
        },
        electiveId: {
            // Using ObjectId is best practice if this is a MongoDB ID
            type: mongoose.Schema.Types.ObjectId, 
            // If you are absolutely sure you want to store it as a simple string, 
            // use type: String, but ObjectId is recommended for IDs.
            required: true 
        }
    }],
    
  createdAt: { type: Date, default: Date.now },
  allocatedElective: { type: String, default: null },
  isConfirmed: { type: Boolean, default: false },
});

module.exports = mongoose.model('User', UserSchema);
