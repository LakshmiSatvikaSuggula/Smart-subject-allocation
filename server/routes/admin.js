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
const Admin=require('../models/Admin')
const Subject=require('../models/Subject')
const Allocation = require("../models/Allotment");
// ---------- Academic Session Routes ----------

// GET /api/student/allocation-status
router.get('/allocation-status', auth, requireRole('student'), async (req, res) => {
  try {
    // Find the current session
    const session = await Session.findOne().sort({ startDate: -1 }).lean();

    res.json({
      allocationLocked: session?.locked || false
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});



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

// Unlock session
router.put('/sessions/:id/unlock', auth, requireRole('admin'), async (req, res) => {
  const session = await Session.findByIdAndUpdate(req.params.id, { locked: false }, { new: true });
  res.json(session);
});

router.get('/profile', auth, requireRole('admin'), async (req, res) => {
  try {
    // ✅ Find admin by regdNo from token payload
    const admin = await Admin.findOne({ regdNo: req.user.regdNo }).select('-password');

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json(admin);
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ---------- Faculty/User Management ----------

// Get all faculty
router.get('/faculty',auth, requireRole('admin'),  async (req, res) => {
  const faculty = await Faculty.find().lean();
  res.json(faculty);
});

// Add new faculty
router.post('/faculty', auth, requireRole('admin'), async (req, res) => {
  try {
    const { name, email, regdNo } = req.body;

    if (!name || !email || !regdNo) {
      return res.status(400).json({ message: 'Name, email, and regdNo are required' });
    }

    // Check duplicates
    const existing = await Faculty.findOne({ regdNo });
    if (existing) return res.status(400).json({ message: 'Faculty already exists' });

    const passwordHash = await bcrypt.hash('default123', 10);

    const newFaculty = new Faculty({
      name,
      email,
      regdNo,
      passwordHash,
      role: 'faculty'
    });

    await newFaculty.save();

    res.status(201).json({ message: 'Faculty created', faculty: newFaculty });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Deactivate faculty
router.put('/faculty/:id/deactivate', auth, requireRole('admin'), async (req, res) => {
  const faculty = await User.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
  res.json(faculty);
});


// ---------- Analytics ----------

// Get analytics for electives
router.get("/analytics", auth, requireRole("admin"), async (req, res) => {
  try {
    // Total students
    const totalStudents = await User.countDocuments({ role: "student" });

    // Allocated electives
    const totalAllocatedElective = await User.countDocuments({ allocatedElective: { $ne: null } });
    const totalUnallocatedElective = totalStudents - totalAllocatedElective;

    // Allocated life skills
    const totalAllocatedLifeSkill = await User.countDocuments({ allocatedLifeSkill: { $ne: null } });
    const totalUnallocatedLifeSkill = totalStudents - totalAllocatedLifeSkill;

    // Subject-wise elective summary (optional)
    // Assuming you have a Subject collection
    const subjects = await Subject.find().lean();
    const subjectData = subjects.map(sub => ({
      subject: sub.subjectName,
      capacity: sub.capacity || 0,
      allocated: sub.allocatedCount || 0 // or calculate manually from Users if needed
    }));

    res.json({
      totalStudents,
      totalAllocatedElective,
      totalUnallocatedElective,
      totalAllocatedLifeSkill,
      totalUnallocatedLifeSkill,
      subjectData
    });

  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------- Export Data ----------

// router.get('/export/allotments', auth, requireRole('admin'), async (req, res) => {
//   const allotments = await Allotment.find().populate('student', 'name regdNo percentage').lean();
//   const workbook = new ExcelJS.Workbook();
//   const sheet = workbook.addWorksheet('Allotments');
//   sheet.addRow(['Roll', 'Name', 'Percentage', 'Subject', 'PreferenceRank', 'Status']);
//   allotments.forEach(a => {
//     sheet.addRow([a.student.regdNo, a.student.name, a.student.percentage, a.subjectCode, a.preferenceRank, a.status]);
//   });
//   res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//   res.setHeader('Content-Disposition', 'attachment; filename=allotments.xlsx');
//   await workbook.xlsx.write(res);
//   res.end();
// });

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

// router.get("/export/excel", auth, requireRole("admin"), async (req, res) => {
//   const allotments = await Allotment.find()
//     .populate("student", "name regdNo percentage")
//     .lean();

//   const workbook = new ExcelJS.Workbook();
//   const sheet = workbook.addWorksheet("Allotments");

//   sheet.addRow(["Roll", "Name", "Percentage", "Subject", "PreferenceRank", "Status"]);

//   allotments.forEach((a) => {
//     sheet.addRow([
//       a.student.regdNo,
//       a.student.name,
//       a.student.percentage,
//       a.subjectCode || "",
//       a.preferenceRank || "",
//       a.status || "",
//     ]);
//   });

//   res.setHeader(
//     "Content-Type",
//     "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//   );
//   res.setHeader("Content-Disposition", "attachment; filename=allotments.xlsx");

//   await workbook.xlsx.write(res);
//   res.end();
// });

// // Export as CSV
// router.get("/export/csv", auth, requireRole("admin"), async (req, res) => {
//   const allotments = await Allotment.find()
//     .populate("student", "name regdNo percentage")
//     .lean();

//   const fields = ["student.regdNo", "student.name", "student.percentage", "subjectCode", "preferenceRank", "status"];
//   const parser = new Parser({ fields });
//   const csv = parser.parse(allotments);

//   res.setHeader("Content-Type", "text/csv");
//   res.setHeader("Content-Disposition", "attachment; filename=allotments.csv");
//   res.send(csv);
// });

// // Export as PDF
// router.get("/export/pdf", auth, requireRole("admin"), async (req, res) => {
//   const allotments = await Allotment.find()
//     .populate("student", "name regdNo percentage")
//     .lean();

//   const doc = new PDFDocument({ size: "A4", margin: 50 });
//   res.setHeader("Content-Type", "application/pdf");
//   res.setHeader("Content-Disposition", "attachment; filename=allotments.pdf");
//   doc.pipe(res);

//   doc.fontSize(18).text("Elective Allotments", { align: "center" });
//   doc.moveDown();

//   allotments.forEach((a, i) => {
//     doc.fontSize(12).text(
//       `${i + 1}. ${a.student.name} (${a.student.regdNo}) | Percentage: ${a.student.percentage} | Subject: ${
//         a.subjectCode || "-"
//       } | Preference: ${a.preferenceRank || "-"} | Status: ${a.status || "-"}`
//     );
//   });

//   doc.end();
// });


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


router.get("/export/pdf", auth, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied" });

  const students = await User.find().lean();

  const doc = new PDFDocument({ margin: 30, size: "A4" });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=allotments.pdf");

  doc.fontSize(18).text("Student Allotments", { align: "center" });
  doc.moveDown();

  students.forEach((stu, idx) => {
    doc.fontSize(12).text(
      `${idx + 1}. Name: ${stu.name}, Email: ${stu.email}, RegdNo: ${stu.regdNo}, Allocated Elective: ${stu.allocatedElective || "N/A"}, Allocated LifeSkill: ${stu.allocatedLifeSkill || "N/A"}`
    );
    doc.moveDown(0.5);
  });

  doc.pipe(res);
  doc.end();
});

// --- Excel export ---
router.get("/export/excel", auth, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied" });

  const students = await User.find().lean();
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Allotments");

  sheet.columns = [
    { header: "Name", key: "name", width: 25 },
    { header: "Email", key: "email", width: 30 },
    { header: "RegdNo", key: "regdNo", width: 15 },
    { header: "Allocated Elective", key: "allocatedElective", width: 25 },
    { header: "Allocated LifeSkill", key: "allocatedLifeSkill", width: 25 },
  ];

  students.forEach((stu) => {
    sheet.addRow({
      name: stu.name,
      email: stu.email,
      regdNo: stu.regdNo,
      allocatedElective: stu.allocatedElective || "N/A",
      allocatedLifeSkill: stu.allocatedLifeSkill || "N/A",
    });
  });

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", "attachment; filename=allotments.xlsx");

  await workbook.xlsx.write(res);
  res.end();
});

// --- CSV export ---
router.get("/export/csv", auth, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied" });

  const students = await User.find().lean();
  const fields = ["name", "email", "regdNo", "allocatedElective", "allocatedLifeSkill"];
  const parser = new Parser({ fields });
  const csv = parser.parse(
    students.map((stu) => ({
      name: stu.name,
      email: stu.email,
      regdNo: stu.regdNo,
      allocatedElective: stu.allocatedElective || "N/A",
      allocatedLifeSkill: stu.allocatedLifeSkill || "N/A",
    }))
  );

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=allotments.csv");
  res.send(csv);
});



module.exports = router;
