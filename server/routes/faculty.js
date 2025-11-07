const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const requireRole = require('../middlewares/requireRole');
const Subject = require('../models/Subject'); // Used for Electives
const multer = require('multer');
const fs = require('fs');
const csv = require('csv-parser');
const upload = multer({ dest: 'tmp/' });
const User = require('../models/User'); // Used for Students
const runAllocation = require('../services/allocate'); // Not used in the new route, but kept
const Allotment = require('../models/Allotment');
const Elective=require('../models/Elective')
const ExcelJS = require('exceljs');
const { Parser } = require('json2csv');
const PDFDocument = require("pdfkit");


// list
router.get('/subjects', auth, requireRole('faculty'), async (req,res) => {
    const subs = await Subject.find().lean();
    res.json(subs);
});

router.post('/run-allocation', auth, requireRole('faculty'), async (req,res) => {
    try {
        const report = await runAllocation();
        res.json({ ok:true, report });
    } catch (err) {
        console.error(err);
        res.status(500).json({ ok:false, error: err.message });
    }
});


// add
router.post('/subjects', auth, requireRole('faculty'), async (req,res) => {
    const { code, name, capacity, eligibility, department } = req.body;
    let s = new Subject({ code, name, capacity, eligibility, department });
    await s.save();
    res.json(s);
});

// edit
router.put('/subjects/:code', auth, requireRole('faculty'), async (req,res) => {
    const { code } = req.params;
    const updates = req.body;
    const s = await Subject.findOneAndUpdate({ code }, updates, { new: true });
    if (!s) return res.status(404).send('Not found');
    res.json(s);
});

// delete
router.delete('/subjects/:code', auth, requireRole('faculty'), async (req,res) => {
    const { code } = req.params;
    await Subject.deleteOne({ code });
    res.json({ ok:true });
});


router.post(
  "/upload-csv",
  auth,
  requireRole("faculty"),
  upload.single("file"),
  async (req, res) => {
    if (!req.file) return res.status(400).json({ ok: false, error: "No file uploaded" });

    const rows = [];
    const filePath = req.file.path;

    try {
      // Read CSV
      fs.createReadStream(filePath)
        .pipe(csv({ mapHeaders: ({ header }) => header.trim().toLowerCase() }))
        .on("data", (data) => {
          rows.push(data);
        })
        .on("end", async () => {
          // Clean up uploaded file
          fs.unlinkSync(filePath);

          // Fetch all valid electives codes
          const electives = await Elective.find({}, "code").lean();
          const validElectiveCodes = electives.map((e) => e.code);

          // Prepare preview and validate preferences
          const preview = rows.map((row, idx) => {
            const preferences = [
              row.preference1,
              row.preference2,
              row.preference3,
              row.preference4,
            ].filter(Boolean); // remove empty

            // Check for invalid electives
            const invalidPrefs = preferences.filter((code) => !validElectiveCodes.includes(code));

            return {
              ...row,
              preferences,
              invalidPreferences: invalidPrefs,
              rowNumber: idx + 1,
            };
          });

          // Collect all invalid rows for response
          const invalidRows = preview.filter((p) => p.invalidPreferences.length > 0);

          if (invalidRows.length > 0) {
            return res.status(400).json({
              ok: false,
              error: "Some rows have invalid elective codes.",
              invalidRows,
            });
          }

          res.json({ ok: true, preview });
        });
    } catch (err) {
      console.error(err);
      res.status(500).json({ ok: false, error: "Server error while processing CSV" });
    }
  }
);



// POST /api/faculty/auto-allocate
router.post("/auto-allocate", auth, requireRole("faculty"), async (req, res) => {
  try {
    const students = await User.find({ role: "student" })
      .populate("preferences.electiveId")
      .sort({ cgpa: -1 }) // high CGPA first
      .lean();

    const electives = await Elective.find().lean();

    // Map elective capacities
    const electiveMap = {};
    electives.forEach(e => {
      electiveMap[e._id.toString()] = {
        ...e,
        allocatedCount: 0
      };
    });

    // Allocate each student
    for (const student of students) {
      let allocated = false;

      // Sort preferences by rank
      const sortedPrefs = (student.preferences || []).sort((a, b) => a.rank - b.rank);

      for (let i = 0; i < sortedPrefs.length; i++) {
        const pref = sortedPrefs[i];
        const elective = electiveMap[pref.electiveId._id.toString()];

        if (!elective) continue;

        // Only check capacity and minPercent for all except last preference
        if (i < sortedPrefs.length - 1) {
          if (elective.allocatedCount >= elective.capacity) continue;
          if (student.percentage < elective.minPercent) continue;
        }

        // Allocate
        await User.findByIdAndUpdate(student._id, {
          allocatedElective: elective._id,
          isConfirmed: false
        });

        // Increment allocated count
        electiveMap[elective._id.toString()].allocatedCount++;

        allocated = true;
        break;
      }

      // If no preference satisfied, assign last preference regardless
      if (!allocated && sortedPrefs.length > 0) {
        const lastPref = sortedPrefs[sortedPrefs.length - 1];
        const elective = electiveMap[lastPref.electiveId._id.toString()];

        await Student.findByIdAndUpdate(student._id, {
          allocatedElective: elective._id,
          isConfirmed: false
        });

        electiveMap[elective._id.toString()].allocatedCount++;
      }
    }

    res.json({ ok: true, message: "Students allocated automatically!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "Failed to auto-allocate students." });
  }
});


router.get("/download-results", auth, requireRole("faculty"), async (req, res) => {
  try {
    const students = await User.find({ role: "student" })
      .populate("preferences.electiveId", "code name")
      .populate("allocatedElective", "code name")
      .lean();

    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Allocations");

    // Add header row
    worksheet.addRow([
      "Regd No",
      "Name",
      "Email",
      "Department",
      "Percentage",
      "CGPA",
      "DOB",
      "Allocated Elective",
      "Preference 1",
      "Preference 2",
      "Preference 3",
      "Preference 4",
    ]);

    // Add student data
    students.forEach((s) => {
      worksheet.addRow([
        s.regdNo,
        s.name,
        s.email,
        s.department,
        s.percentage,
        s.cgpa,
        s.dob ? s.dob.toISOString().split("T")[0] : "",
        s.allocatedElective ? `${s.allocatedElective.name} (${s.allocatedElective.code})` : "",
        s.preferences[0]?.electiveId?.code || "",
        s.preferences[1]?.electiveId?.code || "",
        s.preferences[2]?.electiveId?.code || "",
        s.preferences[3]?.electiveId?.code || "",
      ]);
    });

    // Set column widths (optional, for better formatting)
    worksheet.columns.forEach((col) => {
      col.width = 20;
    });

    // Send workbook as response
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=student_allocations.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to generate Excel file.");
  }
});

router.get("/download-report/pdf", auth, requireRole("faculty"), async (req, res) => {
  try {
    const students = await User.find({ role: "student" })
      .populate("preferences.electiveId", "code name")
      .populate("allocatedElective", "code name")
      .lean();

    // Set headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=student_allocations.pdf");

    const doc = new PDFDocument({ margin: 30, size: "A4" });
    doc.pipe(res);

    doc.fontSize(20).text("Student Allocation Report", { align: "center" });
    doc.moveDown();

    // Table headers
    doc.fontSize(12).text(
      [
        "Regd No",
        "Name",
        "Department",
        "Allocated Elective",
        "Preference1",
        "Preference2",
        "Preference3",
        "Preference4",
      ].join(" | "),
      { underline: true }
    );
    doc.moveDown(0.5);

    // Add student data
    students.forEach((s) => {
      const row = [
        s.regdNo,
        s.name,
        s.department,
        s.allocatedElective ? `${s.allocatedElective.name} (${s.allocatedElective.code})` : "",
        s.preferences[0]?.electiveId?.code || "",
        s.preferences[1]?.electiveId?.code || "",
        s.preferences[2]?.electiveId?.code || "",
        s.preferences[3]?.electiveId?.code || "",
      ].join(" | ");

      doc.text(row);
    });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to generate PDF report.");
  }
});



router.get('/download-student-preferences', auth, requireRole('faculty'), async (req, res) => {
  try {
    // Fetch students and populate each preference's electiveId to get code
    const students = await User.find({ role: 'student' })
      .populate({
        path: 'preferences.electiveId',
        select: 'code name'
      })
      .lean();

    const data = students.map(s => ({
      regdNo: s.regdNo,
      name: s.name,
      email: s.email,
      department: s.department,
      percentage: s.percentage,
      cgpa: s.cgpa,
      dob: s.dob ? s.dob.toISOString().split('T')[0] : '',
      Preference1: s.preferences[0]?.electiveId?.code || '',
      Preference2: s.preferences[1]?.electiveId?.code || '',
      Preference3: s.preferences[2]?.electiveId?.code || '',
      Preference4: s.preferences[3]?.electiveId?.code || ''
    }));

    const csv = new Parser().parse(data);

    res.header('Content-Type', 'text/csv');
    res.attachment('student_preferences.csv');
    res.send(csv);

  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to generate CSV");
  }
});



module.exports = router;