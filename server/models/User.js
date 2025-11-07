const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    // --- Authentication & Core Student Fields ---
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['student', 'admin'], default: 'student', required: true }, // Added 'admin' for completeness
    department: { type: String },
    regdNo: { type: String, index: true },
    
    // --- Academic Performance Fields ---
    percentage: { type: Number },
    cgpa: { type: Number },
    dob: { type: Date },

    // --- Preference Submission Fields (Used by /submit-preferences) ---
    preferences: [{
        rank: {
            type: Number, // Expecting the rank to be a number (1, 2, 3...)
            required: true
        },
        electiveId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Elective', // Reference the Elective model
            required: true 
        }
    }],
    
    // --- Allocation Fields (Used by /allocation-details and /confirm-allocation) ---
    allocatedElective: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Elective', 
        default: null 
    },
    isConfirmed: { 
        type: Boolean, 
        default: false 
    }, // Confirmation of the allocatedElective

    // --- Completed Elective Fields (New requirement for filtering) ---
    completedElectives: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Elective'
    }],

    // --- Timestamps ---
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);