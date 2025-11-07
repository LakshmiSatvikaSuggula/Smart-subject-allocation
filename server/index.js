const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt=require("bcrypt")
const jwt=require("jsonwebtoken")

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Import Routes
const authRoutes = require("./routes/auth");
const facultyRoutes = require("./routes/faculty");
const adminRoutes = require("./routes/admin");
const Student = require("./models/User");
const Faculty = require("./models/Faculty");
const Admin=require("./models/Admin")


// Use Routes
app.use("/api/auth", authRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/admin", adminRoutes);

app.post("/register", async (req, res) => {
  const {
    name,
    email,
    password,
    department,
    regdNo,
    percentage,
    cgpa,
    dob
  } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email and password are required" });
  }

  try {
    // Check if user already exists
    const existingUser = await Student.findOne({ regdNo:regdNo });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new Student({
      name,
      email,
      passwordHash,
      role: "student",
      department,
      regdNo,
      percentage,
      cgpa,
      dob
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({ message: "Registration successful", token, user: newUser });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


app.post("/login", async (req, res) => {
  const { regdNo, password } = req.body;

  if (!regdNo || !password) {
    return res.status(400).json({ message: "regdNo and password required" });
  }

  try {
    // Check all collections in parallel
    const [student, faculty, admin] = await Promise.all([
      Student.findOne({ regdNo }),
      Faculty.findOne({ regdNo }),
      Admin.findOne({ regdNo })
    ]);

    // Find which user exists
    const user = student || faculty || admin;
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Verify password (assuming hashed in DB)
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      console.log(await bcrypt.hash(password,10))
      return res.status(401).json({ message: "Invalid credentials" });
    }
  
    // Generate JWT token
    const payload = {
      id: user._id,
      regdNo: user.regdNo,
      role: student ? "student" : faculty ? "faculty" : "admin"
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "10h" });

    return res.json({ message: "Login successful", token, user: payload });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/", (req, res) => res.send("Smart Subject Allocation Backend 🚀"));

app.listen(PORT, () => console.log(`⚡ Server running on port ${PORT}`));
