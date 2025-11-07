const express = require("express");
const router = express.Router();
const Student = require("../models/User");
const Elective = require("../models/Elective");
const auth = require("../middlewares/auth");
const mongoose = require('mongoose');
const PDFDocument = require("pdfkit");

// --------------------- Get Student Profile ---------------------
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

router.get("/preferences-status/:regdNo", auth, async (req, res) => {
  try {
    const { regdNo } = req.params;

    const student = await Student.findOne({ regdNo })
      .select("-password -__v")
      .populate("completedElectives", "_id name")
      .lean();

    if (!student) return res.status(404).json({ message: "Student not found" });

    const preferencesSubmitted = Array.isArray(student.preferences) && student.preferences.length > 0;

    res.json({
      completedElectives: student.completedElectives || [],
      preferencesSubmitted,
      currentPreferences: student.preferences || [],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});



// --------------------- Get Allocation & Preference Status (New/Modified Comprehensive Endpoint) ---------------------
router.get("/allocation-details", auth, async (req, res) => {
    try {
        const student = await Student.findById(req.user.id)
            .select("-password -__v")
            .populate('allocatedElective', 'name')
            .populate('completedElectives', '_id name')
            .lean();

        if (!student) return res.status(404).json({ ok: false, error: "Student not found." });

        const preferencesSubmitted = Array.isArray(student.preferences) && student.preferences.length > 0;

        const completedElectiveIds = student.completedElectives 
            ? student.completedElectives.map(e => e._id.toString()) 
            : [];

        const allocationData = student.allocatedElective 
            ? { 
                subjectName: student.allocatedElective.name, 
                allocatedAt: student.updatedAt || student.createdAt, 
                isConfirmed: student.isConfirmed || false,
              }
            : null;

        res.json({
            ok: true,
            allocation: allocationData,
            isConfirmed: student.isConfirmed || false,
            preferencesSubmitted: preferencesSubmitted,
            currentPreferences: student.preferences || [],
            completedElectives: completedElectiveIds,
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ ok: false, error: "Failed to fetch student status and data." });
    }
});

// --------------------- Submit Preferences (Modified) ---------------------
router.post("/submit-preferences", auth, async (req, res) => {
    try {
        const studentId = req.user.id;
        const { preferences } = req.body;

        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ ok: false, error: "Student not found." });
        }
        
        // 1. Check for Re-submission
        if (Array.isArray(student.preferences) && student.preferences.length > 0) {
             return res.status(400).json({ ok: false, message: "Preferences have already been submitted. No further changes are allowed." });
        }
        
        // 2. Initial Data Check
        if (!preferences || !Array.isArray(preferences) || preferences.length === 0) {
            return res.status(400).json({ ok: false, message: "Choice 1 is mandatory. Please select at least one preference." });
        }

        // 3. Validate IDs, Ranks, and Check for Completed Elective Conflict
        const electiveIds = [];
        const completedIds = student.completedElectives ? student.completedElectives.map(id => id.toString()) : [];
        
        for (const p of preferences) {
            if (!mongoose.Types.ObjectId.isValid(p.electiveId)) {
                return res.status(400).json({ ok: false, message: `Invalid format for elective ID: ${p.electiveId}` });
            }
            if (typeof p.rank !== 'number' || p.rank < 1) {
                return res.status(400).json({ ok: false, message: "Each preference must have a valid rank (positive number)." });
            }
            
            if (completedIds.includes(p.electiveId)) {
                 return res.status(400).json({ ok: false, message: "You cannot select an elective you have already completed. Please review your choices." });
            }
            electiveIds.push(p.electiveId);
        }

        // 4. Validate Elective Existence
        const validElectives = await Elective.find({ _id: { $in: electiveIds } });
        if (validElectives.length !== electiveIds.length) {
            return res.status(400).json({ ok: false, message: "One or more selected electives do not exist." });
        }

        // 5. Save Data
        student.preferences = preferences;
        await student.save();

        res.json({ ok: true, message: "Preferences submitted successfully.", preferences: student.preferences });
    } catch (err) {
        console.error(err);
        
        if (err.name === 'ValidationError') {
            const errors = Object.keys(err.errors).map(key => err.errors[key].message);
            return res.status(400).json({ ok: false, message: `Validation failed: ${errors.join(', ')}` });
        }

        res.status(500).json({ ok: false, message: "Server error during preference submission." });
    }
});

// --------------------- Confirm Allocation ---------------------
router.post("/confirm-allocation", auth, async (req, res) => {
    try {
        const studentId = req.user.id;
        const student = await Student.findById(studentId);

        if (!student) return res.status(404).json({ ok: false, error: "Student not found." });
        
        if (!student.allocatedElective) {
            return res.status(400).json({ ok: false, error: "No subject has been allocated to confirm." });
        }
        if (student.isConfirmed) {
            return res.status(400).json({ ok: false, error: "Allocation is already confirmed." });
        }

        student.isConfirmed = true;
        await student.save();

        res.json({ ok: true, message: "Allocation confirmed successfully." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ ok: false, error: "Server error during confirmation." });
    }
});

// --------------------- Download Confirmation Slip ---------------------
router.get("/download-slip", auth, async (req, res) => {
  try {
    const student = await Student.findById(req.user.id)
      .populate("allocatedElective", "name code")
      .populate("completedElectives", "name code")
      .lean();

    if (!student) return res.status(404).json({ ok: false, error: "Student not found." });
    if (!student.allocatedElective || !student.isConfirmed)
      return res.status(400).json({ ok: false, error: "Allocation not confirmed yet." });

    // Create PDF
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Elective_Allotment_Slip_${student.regdNo}.pdf`
    );

    doc.pipe(res);

    // ---------------- PDF Content ----------------
    doc.fontSize(20).text("Elective Allotment Confirmation Slip", { align: "center" });
    doc.moveDown(2);

    doc.fontSize(14).text(`Name: ${student.name}`);
    doc.text(`Registration No: ${student.regdNo}`);
    doc.text(`Department: ${student.department}`);
    doc.text(`Email: ${student.email}`);
    doc.text(`Date of Birth: ${student.dob ? new Date(student.dob).toLocaleDateString() : ""}`);
    doc.moveDown();

    doc.fontSize(16).text("Allocated Elective:", { underline: true });
    doc.fontSize(14).text(`Subject Name: ${student.allocatedElective.name}`);
    doc.text(`Subject Code: ${student.allocatedElective.code}`);
    doc.text(`Allocation Confirmed: ${student.isConfirmed ? "✅ Yes" : "❌ No"}`);
    doc.moveDown();

    if (student.completedElectives && student.completedElectives.length > 0) {
      doc.fontSize(16).text("Completed Electives:", { underline: true });
      student.completedElectives.forEach((e, i) => {
        doc.fontSize(14).text(`${i + 1}. ${e.name} (${e.code})`);
      });
    }

    doc.end();
    // ---------------- End PDF ----------------
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "Failed to generate confirmation slip." });
  }
});

module.exports = router;