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
  try {
    const { role, name, email, password, department, regdNo, percentage, cgpa, dob } = req.body;

    // Block any non-student role
    if (role !== "student") {
      return res.status(403).json({ error: "Only students can register." });
    }

    // Check required fields
    if (!name || !email || !password || !department || !regdNo || !percentage || !cgpa || !dob) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Check existing student
    const existingStudent = await Student.findOne({ $or: [{ email }, { regdNo }] });
    if (existingStudent) {
      return res.status(400).json({ error: "Student already exists with this email or regdNo." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newStudent = new Student({
      role,
      name,
      email,
      passwordHash: hashedPassword,
      department,
      regdNo,
      percentage,
      cgpa,
      dob,
    });

    await newStudent.save();
    res.status(201).json({ message: "Student registered successfully!" });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Server error." });
  }
});



app.post("/login", async (req, res) => {
  const { role, regdNo, password } = req.body;

  if (!role || !regdNo || !password) {
    return res.status(400).json({ message: "role, regdNo, and password are required" });
  }

  try {
    let user = null;

    // 🔍 Check user only in the relevant collection
    if (role === "student") {
      user = await Student.findOne({ regdNo });
    } else if (role === "faculty") {
      user = await Faculty.findOne({ regdNo });
    } else if (role === "admin") {
      user = await Admin.findOne({ regdNo });
    } else {
      return res.status(400).json({ message: "Invalid role" });
    }

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // 🔐 Check password (assuming you store bcrypt hashes)
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ✅ Create JWT payload
    const payload = {
      id: user._id,
      regdNo: user.regdNo,
      role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "10h" });

    res.json({ message: "Login successful", token, user: payload });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


app.get("/", (req, res) => res.send("Smart Subject Allocation Backend 🚀"));

app.listen(PORT, () => console.log(`⚡ Server running on port ${PORT}`));
