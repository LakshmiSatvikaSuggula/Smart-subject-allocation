const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth'); // JWT auth middleware
const requireRole = require('../middlewares/requireRole'); // Role check middleware
const Session = require('../models/Session');
const User = require('../models/User');
const Allotment = require('../models/Allotment');
const ExcelJS = require('exceljs');
const PDFDocument = require("pdfkit");
const { Parser } = require("json2csv");
const bcrypt = require('bcrypt');
const Faculty=require('../models/Faculty')
// ---------- Academic Session Routes ----------

// Get all sessions
router.get('/sessions', auth, requireRole('admin'), async (req, res) => {
  const sessions = await Session.find().sort({ startDate: -1 }).lean();
  res.json(sessions);
});

// Create new session
router.post('/sessions', auth, requireRole('admin'), async (req, res) => {
  const { academicYear, semester, startDate, endDate, locked } = req.body;
  const session = new Session({ academicYear, semester, startDate, endDate, locked });
  await session.save();
  res.json(session);
});

// Lock session
router.put('/sessions/:id/lock', auth, requireRole('admin'), async (req, res) => {
  const session = await Session.findByIdAndUpdate(req.params.id, { locked: true }, { new: true });
  res.json(session);
});


// ---------- Faculty/User Management ----------

// Get all faculty
router.get('/faculty',auth, requireRole('admin'),  async (req, res) => {
  const faculty = await Faculty.find().lean();
  res.json(faculty);
});

// Add new faculty
router.post('/faculty',auth, requireRole('admin'), async (req, res) => {
 const { name, email, regdNo } = req.body;
  // Changed department → facultyId
  const passwordHash = await bcrypt.hash('default123', 10);
  const newFaculty = new Faculty({ 
    name, 
    email, 
    regdNo,          // Added facultyId
    password: 'default123' 
  });
  await newFaculty.save();
  res.json(newFaculty);
});

// Deactivate faculty
router.put('/faculty/:id/deactivate', auth, requireRole('admin'), async (req, res) => {
  const faculty = await User.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
  res.json(faculty);
});


// ---------- Analytics ----------

// Get analytics for electives
router.get('/analytics', auth, requireRole('admin'), async (req, res) => {
  const totalStudents = await User.countDocuments({ role: 'student' });
  const totalSubjects = await require('../models/Subject').countDocuments();
  const totalAllocated = await Allotment.countDocuments();
  const totalUnallocated = totalStudents - totalAllocated;

  res.json({
    totalStudents,
    totalSubjects,
    totalAllocated,
    totalUnallocated,
  });
});


// ---------- Export Data ----------

router.get('/export/allotments', auth, requireRole('admin'), async (req, res) => {
  const allotments = await Allotment.find().populate('student', 'name regdNo percentage').lean();
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Allotments');
  sheet.addRow(['Roll', 'Name', 'Percentage', 'Subject', 'PreferenceRank', 'Status']);
  allotments.forEach(a => {
    sheet.addRow([a.student.regdNo, a.student.name, a.student.percentage, a.subjectCode, a.preferenceRank, a.status]);
  });
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=allotments.xlsx');
  await workbook.xlsx.write(res);
  res.end();
});

// Analytics Dashboard
router.get('/analytics', auth, requireRole('admin'), async (req, res) => {
  try {
    // Total students
    const totalStudents = await User.countDocuments({ role: 'student' });

    // Total subjects
    const totalSubjects = await Subject.countDocuments();

    // Allocated students
    const totalAllocated = await Allotment.countDocuments();

    // Unallocated students
    const totalUnallocated = totalStudents - totalAllocated;

    // Subject-wise allocation (for charts)
    const subjects = await Subject.find().lean();
    const subjectData = await Promise.all(
      subjects.map(async (sub) => {
        const count = await Allotment.countDocuments({ subjectCode: sub.code });
        return { subject: sub.name, allocated: count, capacity: sub.capacity };
      })
    );

    res.json({
      totalStudents,
      totalSubjects,
      totalAllocated,
      totalUnallocated,
      subjectData
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/export/excel", auth, requireRole("admin"), async (req, res) => {
  const allotments = await Allotment.find()
    .populate("student", "name regdNo percentage")
    .lean();

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Allotments");

  sheet.addRow(["Roll", "Name", "Percentage", "Subject", "PreferenceRank", "Status"]);

  allotments.forEach((a) => {
    sheet.addRow([
      a.student.regdNo,
      a.student.name,
      a.student.percentage,
      a.subjectCode || "",
      a.preferenceRank || "",
      a.status || "",
    ]);
  });

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", "attachment; filename=allotments.xlsx");

  await workbook.xlsx.write(res);
  res.end();
});

// Export as CSV
router.get("/export/csv", auth, requireRole("admin"), async (req, res) => {
  const allotments = await Allotment.find()
    .populate("student", "name regdNo percentage")
    .lean();

  const fields = ["student.regdNo", "student.name", "student.percentage", "subjectCode", "preferenceRank", "status"];
  const parser = new Parser({ fields });
  const csv = parser.parse(allotments);

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=allotments.csv");
  res.send(csv);
});

// Export as PDF
router.get("/export/pdf", auth, requireRole("admin"), async (req, res) => {
  const allotments = await Allotment.find()
    .populate("student", "name regdNo percentage")
    .lean();

  const doc = new PDFDocument({ size: "A4", margin: 50 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=allotments.pdf");
  doc.pipe(res);

  doc.fontSize(18).text("Elective Allotments", { align: "center" });
  doc.moveDown();

  allotments.forEach((a, i) => {
    doc.fontSize(12).text(
      `${i + 1}. ${a.student.name} (${a.student.regdNo}) | Percentage: ${a.student.percentage} | Subject: ${
        a.subjectCode || "-"
      } | Preference: ${a.preferenceRank || "-"} | Status: ${a.status || "-"}`
    );
  });

  doc.end();
});


router.get('/faculty', auth, requireRole('admin'), async (req, res) => {
  const faculty = await Faculty.find().lean();
  res.json(faculty);
});

// Add new faculty
router.post('/faculty', auth, requireRole('admin'), async (req, res) => {
  try {
    const { facultyId, name, email } = req.body;
    const f = new Faculty({ facultyId, name, email });
    await f.save();
    res.json(f);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// Delete a faculty
router.delete('/faculty/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    await Faculty.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update a faculty (optional)
router.put('/faculty/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const updates = req.body;
    const f = await Faculty.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!f) return res.status(404).json({ error: 'Faculty not found' });
    res.json(f);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


module.exports = router;
