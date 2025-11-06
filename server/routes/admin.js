const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const requireRole = require('../middlewares/requireRole');
const Session = require('../models/Session');
const User = require('../models/User');

router.post('/session', auth, requireRole('admin'), async (req,res) => {
  const s = new Session(req.body);
  await s.save();
  res.json(s);
});

router.put('/session/:id/lock', auth, requireRole('admin'), async (req,res) => {
  const s = await Session.findByIdAndUpdate(req.params.id, { locked: req.body.locked }, { new:true });
  res.json(s);
});

router.get('/users', auth, requireRole('admin'), async (req,res) => {
  const users = await User.find().select('-passwordHash').lean();
  res.json(users);
});

module.exports = router;
