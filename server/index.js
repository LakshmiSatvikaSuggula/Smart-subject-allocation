const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'yourStrongSecretKey123'; // Change for production

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/vignan', {
  useNewUrlParser: true, useUnifiedTopology: true,
});

// User schema
const userSchema = new mongoose.Schema({
  regdNo: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: String,
  name: String,
  email: String,
  department: String,
  percentage: String,
  cgpa: String,
  dob: String,
});

const User = mongoose.model('User', userSchema);

// App initialization
const app = express();
app.use(cors());
app.use(express.json());

// Registration endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { regdNo, password, name, email, department, percentage, cgpa, dob, role } = req.body;

    if (!regdNo || !password || !name || !email || !department || !percentage || !cgpa || !dob || !role) {
      return res.status(400).json({ error: 'Please fill all fields.' });
    }

    const userExisting = await User.findOne({ regdNo });
    if (userExisting) return res.status(400).json({ error: 'User already exists.' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      regdNo, password: hashedPassword, name, email, department, percentage, cgpa, dob, role
    });

    await user.save();
    res.json({ message: 'User registered successfully!' });
  } catch (e) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { regdNo, password, role } = req.body;
    if (!regdNo || !password) {
      return res.status(400).json({ error: 'Please enter all fields.' });
    }
    const user = await User.findOne({ regdNo });
    if (!user) {
      return res.status(400).json({ error: 'User not found.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid password.' });

    // (Optional) Check role match if needed: if (user.role !== role) return res.status(400).json({ error: 'Role mismatch.' });

    const token = jwt.sign({ regdNo: user.regdNo, id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '2h' });
    res.json({ token, user: {
      regdNo: user.regdNo, name: user.name, role: user.role, email: user.email, department: user.department
    }});
  } catch (e) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// (Optional) Protected route example:
app.get('/api/protected', (req, res) => {
  const bearer = req.headers.authorization;
  if (!bearer) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(bearer.split(' ')[1], JWT_SECRET);
    res.json({ message: 'You are authorized', decoded });
  } catch {
    res.status(401).json({ error: 'Token invalid' });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
