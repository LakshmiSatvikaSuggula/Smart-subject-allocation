const express = require("express");
const router = express.Router();
const Elective = require("../models/Elective");

// GET all electives
router.get("/", async (req, res) => {
  try {
    const electives = await Elective.find();
    res.json(electives);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new elective
router.post("/", async (req, res) => {
  try {
    const elective = new Elective(req.body);
    await elective.save();
    res.status(201).json(elective);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE elective by code
router.delete("/:code", async (req, res) => {
  try {
    const result = await Elective.findOneAndDelete({ code: req.params.code });
    if (!result) return res.status(404).json({ error: "Elective not found" });
    res.json({ message: "Elective deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
