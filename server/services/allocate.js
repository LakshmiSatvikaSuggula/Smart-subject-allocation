const User = require('../models/User');
const Subject = require('../models/Subject');
const Allotment = require('../models/Allotment');

async function runAllocation() {
  // 1. fetch students
  const students = await User.find({ role: 'student' }).lean();
  // 2. sort
  students.sort((a,b) => {
    if ((b.percentage||0) !== (a.percentage||0)) return (b.percentage||0) - (a.percentage||0);
    if ((b.cgpa||0) !== (a.cgpa||0)) return (b.cgpa||0) - (a.cgpa||0);
    if (a.dob && b.dob) return new Date(a.dob) - new Date(b.dob);
    return 0;
  });

  // 3. load subjects
  const subjects = await Subject.find().lean();
  const map = {};
  for (const s of subjects) map[s.code] = { ...s };

  // 4. clear previous allotments (simple)
  await Allotment.deleteMany({});

  const summary = { allocated:0, unassigned:0 };

  for (const st of students) {
    let allocated = false;
    const prefs = st.preferences || [];
    for (let i=0;i<prefs.length;i++){
      const code = prefs[i];
      const sub = map[code];
      if (!sub) continue;
      // eligibility check example (if sub.eligibility like ">=60")
      if (sub.capacity > (sub.filled || 0)) {
        // create allotment
        await Allotment.create({
          student: st._id,
          subjectCode: code,
          preferenceRank: i+1,
          status: 'allocated',
          allocatedAt: new Date()
        });
        // increment map filled so next allocations see it
        map[code].filled = (map[code].filled || 0) + 1;
        allocated = true;
        summary.allocated++;
        break;
      }
    }
    if (!allocated) {
      await Allotment.create({ student: st._id, status: 'unassigned' });
      summary.unassigned++;
    }
  }

  // 5. update Subject.filled values to DB
  for (const code of Object.keys(map)) {
    await Subject.updateOne({ code }, { $set: { filled: map[code].filled || 0 } });
  }

  return summary;
}

module.exports = runAllocation;
