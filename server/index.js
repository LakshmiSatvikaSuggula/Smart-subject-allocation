const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt=require("bcrypt")
const jwt=require("jsonwebtoken")
const nodemailer=require("nodemailer")
const studentRoutes = require("./routes/student");

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
const electiveRoutes = require("./routes/electives");
const lifeSkillsRouter = require("./routes/lifeskill");
const lifeSkills=require('./routes/lifeSkillsStudent')




// Use Routes
app.use("/api/auth", authRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/admin", adminRoutes);
app.use("/electives", electiveRoutes);
app.use("/api/student", studentRoutes);
app.use("/lifeskills", lifeSkillsRouter);
app.use("/api/lifeskillsStudent", lifeSkills);

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

app.post("/forgot-password", async (req, res) => {
  const { role, regdNo, facultyId, adminId } = req.body;

  try {
    let user = null;
    let email = null;

    // ✅ Determine user collection based on role
    if (role === "student") {
      user = await Student.findOne({ regdNo });
      if (user) email = user.email;
    } else if (role === "faculty") {
      user = await Faculty.findOne({ regdNo: facultyId });
      if (user) email = user.email;
    } else if (role === "admin") {
      user = await Admin.findOne({ regdNo: adminId });
      if (user) email = user.email;
    } else {
      return res.status(400).json({ message: "Invalid role" });
    }

    // 🔐 Always respond with success to avoid user enumeration
    if (!user) {
      return res.json({
        message:
          "If an account with that ID exists, a password reset link has been sent to the associated email address.",
      });
    }

    // Generate a reset token
    const resetToken = jwt.sign(
      { id: user._id, role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const resetLink = `http://localhost:5173/reset-password/${resetToken}`;

    // Configure Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // e.g., your Gmail
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email content
    const mailOptions = {
      from: `"Smart Subject Allocation" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset Request",
      html: `
        <p>Hello ${user.name || "User"},</p>
        <p>You requested to reset your password. Please click the link below to set a new one:</p>
        <a href="${resetLink}" target="_blank">${resetLink}</a>
        <p>This link will expire in 15 minutes.</p>
        <p>If you didn't request this, you can ignore this email.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.json({
      message:
        "If an account with that ID exists, a password reset link has been sent to the associated email address.",
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});


app.get("/", (req, res) => res.send("Smart Subject Allocation Backend 🚀"));

app.listen(PORT, () => console.log(`⚡ Server running on port ${PORT}`));
