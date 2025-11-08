const express = require("express");
const router = express.Router();
const Student = require("../models/User");
const LifeSkill = require("../models/LifeSkill"); // new model
const auth = require("../middlewares/auth");
const mongoose = require('mongoose');
const PDFDocument = require("pdfkit");

// --------------------- Get Life Skill Preferences Status ---------------------
router.get("/preferences-status/:regdNo", auth, async (req, res) => {
  try {
    const { regdNo } = req.params;

    const student = await Student.findOne({ regdNo })
      .select("-password -__v")
      .populate("completedLifeSkills", "_id name")
      .lean();

    if (!student) return res.status(404).json({ message: "Student not found" });

    const preferencesSubmitted = Array.isArray(student.lifeSkillPreferences) && student.lifeSkillPreferences.length > 0;

    res.json({
      completedLifeSkills: student.completedLifeSkills || [],
      preferencesSubmitted,
      currentPreferences: student.lifeSkillPreferences || [],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// --------------------- Get Allocation & Preference Status for Life Skills ---------------------
router.get("/allocation-details", auth, async (req, res) => {
  try {
    const student = await Student.findById(req.user.id)
      .select("-password -__v")
      .populate('allocatedLifeSkill', 'name')
      .populate('completedLifeSkills', '_id name')
      .lean();

    if (!student) return res.status(404).json({ ok: false, error: "Student not found." });

    const preferencesSubmitted = Array.isArray(student.lifeSkillPreferences) && student.lifeSkillPreferences.length > 0;

    const completedLifeSkillIds = student.completedLifeSkills
      ? student.completedLifeSkills.map(e => e._id.toString())
      : [];

    const allocationData = student.allocatedLifeSkill
      ? {
          subjectName: student.allocatedLifeSkill.name,
          allocatedAt: student.updatedAt || student.createdAt,
          isConfirmed: student.isLifeSkillConfirmed || false,
        }
      : null;

    res.json({
      ok: true,
      allocation: allocationData,
      isConfirmed: student.isLifeSkillConfirmed || false,
      preferencesSubmitted,
      currentPreferences: student.lifeSkillPreferences || [],
      completedLifeSkills: completedLifeSkillIds,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "Failed to fetch student status and data." });
  }
});

// --------------------- Submit Life Skill Preferences ---------------------
router.post("/submit-preferences", auth, async (req, res) => {
  try {
    const studentId = req.user.id;
    const { preferences } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ ok: false, error: "Student not found." });
    }

    // Prevent re-submission
    if (Array.isArray(student.lifeSkillPreferences) && student.lifeSkillPreferences.length > 0) {
      return res.status(400).json({ ok: false, message: "Preferences have already been submitted." });
    }

    if (!preferences || !Array.isArray(preferences) || preferences.length === 0) {
      return res.status(400).json({ ok: false, message: "Choice 1 is mandatory." });
    }

    const skillIds = [];
    const completedIds = student.completedLifeSkills
      ? student.completedLifeSkills.map(id => id.toString())
      : [];

    for (const p of preferences) {
      if (!mongoose.Types.ObjectId.isValid(p.lifeSkillId)) {
        return res.status(400).json({ ok: false, message: `Invalid life skill ID: ${p.lifeSkillId}` });
      }
      if (typeof p.rank !== "number" || p.rank < 1) {
        return res.status(400).json({ ok: false, message: "Each preference must have a valid rank." });
      }
      if (completedIds.includes(p.lifeSkillId)) {
        return res.status(400).json({ ok: false, message: "Cannot select a life skill already completed." });
      }
      skillIds.push(p.lifeSkillId);
    }

    const validLifeSkills = await LifeSkill.find({ _id: { $in: skillIds } });
    if (validLifeSkills.length !== skillIds.length) {
      return res.status(400).json({ ok: false, message: "One or more selected life skills do not exist." });
    }

    student.lifeSkillPreferences = preferences;
    await student.save();

    res.json({ ok: true, message: "Life skill preferences submitted successfully.", preferences });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: "Server error during life skill preference submission." });
  }
});

// --------------------- Confirm Life Skill Allocation ---------------------
router.post("/confirm-allocation", auth, async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    if (!student) return res.status(404).json({ ok: false, error: "Student not found." });

    if (!student.allocatedLifeSkill) {
      return res.status(400).json({ ok: false, error: "No life skill allocated yet." });
    }
    if (student.isLifeSkillConfirmed) {
      return res.status(400).json({ ok: false, error: "Already confirmed." });
    }

    student.isLifeSkillConfirmed = true;
    await student.save();

    res.json({ ok: true, message: "Life skill allocation confirmed successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "Server error during confirmation." });
  }
});

// --------------------- Download Life Skill Confirmation Slip ---------------------
router.get("/download-slip", auth, async (req, res) => {
  try {
    const student = await Student.findById(req.user.id)
      .populate("allocatedLifeSkill", "name code")
      .populate("completedLifeSkills", "name code")
      .lean();

    if (!student) return res.status(404).json({ ok: false, error: "Student not found." });
    if (!student.allocatedLifeSkill || !student.isLifeSkillConfirmed)
      return res.status(400).json({ ok: false, error: "Life skill allocation not confirmed yet." });

    const doc = new PDFDocument({ size: "A4", margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=LifeSkill_Slip_${student.regdNo}.pdf`);

    doc.pipe(res);

    doc.fontSize(20).text("Life Skill Allocation Confirmation Slip", { align: "center" });
    doc.moveDown(2);

    doc.fontSize(14).text(`Name: ${student.name}`);
    doc.text(`Registration No: ${student.regdNo}`);
    doc.text(`Department: ${student.department}`);
    doc.text(`Email: ${student.email}`);
    doc.moveDown();

    doc.fontSize(16).text("Allocated Life Skill:", { underline: true });
    doc.fontSize(14).text(`Name: ${student.allocatedLifeSkill.name}`);
    doc.text(`Code: ${student.allocatedLifeSkill.code}`);
    doc.text(`Confirmed: ${student.isLifeSkillConfirmed ? "✅ Yes" : "❌ No"}`);
    doc.moveDown();

    if (student.completedLifeSkills && student.completedLifeSkills.length > 0) {
      doc.fontSize(16).text("Completed Life Skills:", { underline: true });
      student.completedLifeSkills.forEach((e, i) => {
        doc.fontSize(14).text(`${i + 1}. ${e.name} (${e.code})`);
      });
    }

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "Failed to generate confirmation slip." });
  }
});

module.exports = router;
