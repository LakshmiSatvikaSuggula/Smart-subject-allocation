const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const requireRole = require('../middlewares/requireRole');
const Subject = require('../models/Subject');
const multer = require('multer');
const fs = require('fs');
const csv = require('csv-parser');
const upload = multer({ dest: 'tmp/' });
const User = require('../models/User');
const runAllocation = require('../services/allocate');
const Allotment = require('../models/Allotment');
const ExcelJS = require('exceljs');

//list
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



router.post('/upload-csv', auth, requireRole('faculty'), upload.single('file'), async (req,res) => {
  if (!req.file) return res.status(400).send('No file');
  const rows = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => rows.push(data))
    .on('end', async () => {
      // Preview: return first 5 rows for frontend confirm
      const preview = rows.slice(0,5);
      // Upsert users (simple implementation)
      for (const r of rows) {
        const roll = r.Roll || r.RollNo || r.roll;
        const name = r.Name || r.name;
        const percentage = parseFloat(r.Percentage || r.perc || r.percentage) || 0;
        const prefs = [];
        if (r.Preference1) prefs.push(r.Preference1);
        if (r.Preference2) prefs.push(r.Preference2);
        if (r.Preference3) prefs.push(r.Preference3);
        // upsert user with role student
        await User.findOneAndUpdate(
          { regdNo: roll },
          { name, regdNo: roll, percentage, preferences: prefs, role: 'student' },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      }
      // remove temp file
      fs.unlinkSync(req.file.path);
      res.json({ ok:true, previewCount: preview.length });
    });
});


router.get('/allotments', auth, requireRole('faculty'), async (req,res) => {
  const rows = await Allotment.find().populate('student','name regdNo percentage').lean();
  res.json(rows);
});




router.get('/download-results', auth, requireRole('faculty'), async (req,res) => {
  const rows = await Allotment.find().populate('student','name regdNo percentage').lean();
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Allotments');
  sheet.addRow(['Roll','Name','Percentage','Subject','PreferenceRank','Status']);
  for (const r of rows) {
    sheet.addRow([r.student.regdNo, r.student.name, r.student.percentage, r.subjectCode || '', r.preferenceRank || '', r.status]);
  }
  res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition','attachment; filename=allotments.xlsx');
  await workbook.xlsx.write(res);
  res.end();
});


module.exports = router;
