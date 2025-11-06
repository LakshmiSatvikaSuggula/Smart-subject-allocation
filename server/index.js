const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'YourSecretKeyHere';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/vignan', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User schema (no unique for regdNo)
const userSchema = new mongoose.Schema({
  regdNo: String,
  name: String,
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  department: String,
  percentage: String,
  cgpa: String,
  dob: String,
});
const User = mongoose.model('User', userSchema);

const app = express();
app.use(cors());
app.use(express.json());

// Seed default admin if doesn't exist
const seedAdmin = async () => {
  const adminExists = await User.findOne({ role: 'admin' });
  if (!adminExists) {
    const hash = await bcrypt.hash('admin123', 10);
    await User.create({
      email: 'admin@vignan.edu',
      password: hash,
      role: 'admin',
    });
    console.log('Default admin account created: admin@vignan.edu / admin123');
  }
};
seedAdmin();

// Registration
app.post('/api/register', async (req, res) => {
  console.log('Registration data:', req.body);

  try {
    const { role } = req.body;
    if (role === 'admin') {
      return res.status(400).json({ error: "Admin cannot register here. Please login." });
    }

    if (role === 'student') {
      const { regdNo, name, email, password, department, percentage, cgpa, dob } = req.body;
      if (!regdNo || !name || !email || !password || !department || !percentage || !cgpa || !dob) {
        return res.status(400).json({ error: "Please fill all fields." });
      }
      // Uniqueness enforced in code, not schema
      if (await User.findOne({ regdNo, role: "student" })) 
        return res.status(400).json({ error: "Registration number already registered." });
      if (await User.findOne({ email, role: "student" })) 
        return res.status(400).json({ error: "Email already registered." });

      const hash = await bcrypt.hash(password, 10);
      await User.create({
        regdNo, name, email, password: hash, role: "student", department, percentage, cgpa, dob
      });
      return res.json({ message: "Student registered successfully." });

    } else if (role === 'faculty') {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ error: "Please fill all fields." });
      if (await User.findOne({ email, role: "faculty" }))
        return res.status(400).json({ error: "Email already registered." });
      const hash = await bcrypt.hash(password, 10);
      await User.create({ email, password: hash, role: "faculty" });
      return res.json({ message: "Faculty registered successfully." });
    }

    return res.status(400).json({ error: "Invalid role." });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { role, regdNo, email, password } = req.body;
    let user;

    // Student: login with regdNo
    if (role === 'student') {
      if (!regdNo || !password) return res.status(400).json({ error: "Please fill all fields." });
      user = await User.findOne({ regdNo, role: "student" });
      if (!user) return res.status(400).json({ error: "User not found." });
    }
    // Faculty/Admin: login with email
    else if (role === 'faculty' || role === 'admin') {
      if (!email || !password) return res.status(400).json({ error: "Please fill all fields." });
      user = await User.findOne({ email, role });
      if (!user) return res.status(400).json({ error: `${role.charAt(0).toUpperCase() + role.slice(1)} not found.` });
    } else {
      return res.status(400).json({ error: "Invalid role." });
    }

    const matched = await bcrypt.compare(password, user.password);
    if (!matched) return res.status(400).json({ error: "Invalid password." });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '2h' });
    return res.json({ token, user: { id: user._id, name: user.name, regdNo: user.regdNo, email: user.email, role: user.role } });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
