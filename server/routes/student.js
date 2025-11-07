const express = require("express");
const router = express.Router();
const Student = require("../models/User");
const Elective = require("../models/Elective");
const auth = require("../middlewares/auth");
const mongoose = require('mongoose');

// --------------------- Get Logged-in Student ---------------------



router.get("/status", auth, async (req, res) => {
    try {
        // Find student and populate the allocatedElective details
        const student = await Student.findById(req.user.id)
            .populate('allocatedElective', 'name'); // Populate with 'name' field from the Elective model

        if (!student) return res.status(404).json({ ok: false, error: "Student not found." });

        // Prepare the response data structure that the frontend expects
        const allocationData = student.allocatedElective 
            ? {
                subjectName: student.allocatedElective.name, // The populated subject name
                allocatedAt: student.updatedAt || student.createdAt, // Use update date or creation date as a placeholder
                isConfirmed: student.isConfirmed, // The new field
            }
            : null;

        res.json({
            ok: true,
            allocation: allocationData,
            isConfirmed: student.isConfirmed || false,
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ ok: false, error: "Failed to fetch allocation status." });
    }
});


// routes/student.js

// --------------------- Confirm Allocation ---------------------
// POST /api/student/confirm-allocation
router.post("/confirm-allocation", auth, async (req, res) => {
    try {
        const studentId = req.user.id;
        const student = await Student.findById(studentId);

        if (!student) return res.status(404).json({ ok: false, error: "Student not found." });
        
        // Validation check
        if (!student.allocatedElective) {
            return res.status(400).json({ ok: false, error: "No subject has been allocated to confirm." });
        }
        if (student.isConfirmed) {
            return res.status(400).json({ ok: false, error: "Allocation is already confirmed." });
        }

        // Set confirmation status
        student.isConfirmed = true;
        await student.save();

        res.json({ ok: true, message: "Allocation confirmed successfully." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ ok: false, error: "Server error during confirmation." });
    }
});



router.get("/me", auth, async (req, res) => {
  try {
    const student = await Student.findById(req.user.id).select("-password -__v");
    if (!student) return res.status(404).json({ ok: false, error: "Student not found" });
    res.json({ ok: true, student });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

// --------------------- Submit Preferences ---------------------
router.post("/submit-preferences", auth, async (req, res) => {
    try {
        const studentId = req.user.id;
        const { preferences } = req.body; // Expects: [{ rank: 1, electiveId: "..." }, ...]

        // 1. Initial Data Check
        if (!preferences || !Array.isArray(preferences) || preferences.length === 0) {
            return res.status(400).json({ ok: false, error: "Preferences are required." });
        }

        // 2. Validate MongoDB Object IDs (Security and Crash Prevention)
        const electiveIds = [];
        for (const p of preferences) {
            // Check if the electiveId is a valid ObjectId string
            if (!mongoose.Types.ObjectId.isValid(p.electiveId)) {
                return res.status(400).json({ ok: false, error: `Invalid format for elective ID: ${p.electiveId}` });
            }
            // Check if rank is a positive number
            if (typeof p.rank !== 'number' || p.rank < 1) {
                return res.status(400).json({ ok: false, error: "Each preference must have a valid rank (positive number)." });
            }
            electiveIds.push(p.electiveId);
        }

        // 3. Validate Elective Existence
        const validElectives = await Elective.find({ _id: { $in: electiveIds } });
        if (validElectives.length !== electiveIds.length) {
            // This happens if a validly formatted ID doesn't exist in the DB.
            return res.status(400).json({ ok: false, error: "One or more selected electives do not exist." });
        }

        // 4. Find and Update Student
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ ok: false, error: "Student not found." });
        }

        // 5. Save Data (Mongoose will implicitly validate the structure against the schema)
        student.preferences = preferences;
        await student.save();

        res.json({ ok: true, message: "Preferences submitted successfully.", preferences: student.preferences });
    } catch (err) {
        console.error(err);
        
        // Handle Mongoose Validation Error (like if the schema still wasn't fixed correctly)
        if (err.name === 'ValidationError') {
            const errors = Object.keys(err.errors).map(key => err.errors[key].message);
            return res.status(400).json({ ok: false, error: `Validation failed: ${errors.join(', ')}` });
        }

        // Default Server Error
        res.status(500).json({ ok: false, error: "Server error during preference submission." });
    }
});
// --------------------- Get Allocation Status ---------------------
router.get("/status", auth, async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    if (!student) return res.status(404).json({ ok: false, error: "Student not found." });

    res.json({
      ok: true,
      allocatedElective: student.allocatedElective || null,
      preferences: student.preferences || [],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "Failed to fetch allocation status." });
  }
});

// --------------------- Download Confirmation Slip ---------------------
router.get("/download-slip", auth, async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    if (!student) return res.status(404).json({ ok: false, error: "Student not found." });

    const slip = {
      regdNo: student.regdNo,
      name: student.name,
      allocatedElective: student.allocatedElective || "Not allocated",
      preferences: student.preferences || [],
    };

    res.json({ ok: true, slip });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "Failed to generate confirmation slip." });
  }
});

module.exports = router;
