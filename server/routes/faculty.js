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
const ExcelJS = require('exceljs');

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


router.post('/upload-csv', auth, requireRole('faculty'), upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).send('No file uploaded');

    const rows = [];
    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => rows.push(data))
        .on('end', async () => {
            const preview = rows.slice(0, 5); // first 5 rows for preview
            try {
                // Fetch all elective subjects to map codes to ObjectIds for later use
                const subjectCodes = await Subject.find().select('code _id').lean();
                const codeToIdMap = new Map(subjectCodes.map(s => [s.code, s._id]));

                for (const r of rows) {
                    const roll = r.RollNo || r.regdNo || r.Roll;
                    const name = r.Name || r.name;
                    const email = r.Email || r.email;
                    const department = r.Department || r.department || '';
                    const percentage = parseFloat(r.Percentage || r.perc || 0);
                    const cgpa = parseFloat(r.CGPA || r.cgpa || 0);
                    const dob = r.DOB ? new Date(r.DOB) : null;

                    // Convert preference codes (from CSV) to an array of codes
                    const preferenceCodes = [];
                    if (r.Preference1) preferenceCodes.push(r.Preference1);
                    if (r.Preference2) preferenceCodes.push(r.Preference2);
                    if (r.Preference3) preferenceCodes.push(r.Preference3);

                    // Map the codes to a structured preference array (as expected by a robust algorithm)
                    const preferences = preferenceCodes
                        .map((code, index) => {
                            const electiveId = codeToIdMap.get(code);
                            // Only store valid preferences that match an existing subject
                            return electiveId ? { rank: index + 1, electiveId: electiveId } : null;
                        })
                        .filter(p => p !== null);


                    await User.findOneAndUpdate(
                        { regdNo: roll },
                        {
                            name,
                            email,
                            role: 'student',
                            department,
                            regdNo: roll,
                            percentage,
                            cgpa,
                            dob,
                            preferences, // Save the structured array of preferences
                        },
                        { upsert: true, new: true, setDefaultsOnInsert: true }
                    );
                }

                fs.unlinkSync(req.file.path);
                res.json({ ok: true, previewCount: preview.length });
            } catch (err) {
                console.error(err);
                fs.unlinkSync(req.file.path);
                res.status(500).json({ ok: false, error: err.message });
            }
        });
});


// POST /api/faculty/auto-allocate
router.post("/auto-allocate", auth, requireRole('faculty'), async (req, res) => {
    try {
        // Fetch all students and electives (using .lean() for performance)
        let students = await User.find({ role: 'student' }).lean();
        const electives = await Subject.find({}).lean();

        // 1. **CRITICAL FIX: Sort students by merit (CGPA/Percentage)**
        students.sort((a, b) => {
            // Prioritize CGPA, fall back to Percentage if CGPA is zero/null
            const meritA = a.cgpa || a.percentage || 0;
            const meritB = b.cgpa || b.percentage || 0;
            return meritB - meritA; // Descending sort (highest merit first)
        });

        // 2. Setup capacity tracking and subject lookup map
        const capacityMap = new Map(electives.map(e => [e._id.toString(), {
            capacity: e.capacity,
            allocatedCount: 0,
            code: e.code,
            eligibility: e.eligibility || 0
        }]));
        
        const subjectCodeToIdMap = new Map(electives.map(e => [e.code, e._id]));
        const subjectIdToCodeMap = new Map(electives.map(e => [e._id.toString(), e.code]));

        const studentBulkUpdates = [];
        let allocatedCount = 0;

        // 3. Iterate through students by merit and perform allocation
        for (const student of students) {
            let allocatedElectiveId = null;

            // Iterate through the structured preferences array: [{ rank: 1, electiveId: "ID" }]
            for (const pref of student.preferences) {
                const electiveIdStr = pref.electiveId.toString();
                const electiveStatus = capacityMap.get(electiveIdStr);

                if (!electiveStatus) continue; // Subject not found

                const studentMerit = student.cgpa || student.percentage || 0;

                // Check eligibility AND capacity
                if (studentMerit >= electiveStatus.eligibility && electiveStatus.allocatedCount < electiveStatus.capacity) {
                    // Allocation successful
                    allocatedElectiveId = pref.electiveId; // This is the ObjectId
                    electiveStatus.allocatedCount += 1;
                    allocatedCount++;
                    break; // Move to the next student
                }
            }
            
            // Prepare update operation for the student
            studentBulkUpdates.push({
                updateOne: {
                    filter: { _id: student._id },
                    update: { $set: { 
                        allocatedElective: allocatedElectiveId, 
                        isConfirmed: false 
                    }}
                }
            });
        }
        
        // 4. Execute Bulk Write for Students
        await User.bulkWrite(studentBulkUpdates);

        // 5. Execute Bulk Write for Subjects (updating currentEnrollment)
        const subjectBulkUpdates = [];
        capacityMap.forEach((status, id) => {
            subjectBulkUpdates.push({
                updateOne: {
                    filter: { _id: id },
                    update: { $set: { currentEnrollment: status.allocatedCount } }
                }
            });
        });
        await Subject.bulkWrite(subjectBulkUpdates);


        res.json({ ok: true, message: `Automatic allocation completed! ${allocatedCount} students were allocated.` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ ok: false, error: "Automatic allocation failed." });
    }
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