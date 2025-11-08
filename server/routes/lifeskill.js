const express = require("express");
const router = express.Router();
const LifeSkill = require("../models/LifeSkill"); // Make sure the schema file is named LifeSkill.js

// GET all life skills
router.get("/", async (req, res) => {
  try {
    const lifeSkills = await LifeSkill.find();
    res.json(lifeSkills);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new life skill
router.post("/", async (req, res) => {
  try {
    const lifeSkill = new LifeSkill(req.body);
    await lifeSkill.save();
    res.status(201).json(lifeSkill);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE life skill by code
router.delete("/:code", async (req, res) => {
  try {
    const result = await LifeSkill.findOneAndDelete({ code: req.params.code });
    if (!result) return res.status(404).json({ error: "Life Skill not found" });
    res.json({ message: "Life Skill deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
