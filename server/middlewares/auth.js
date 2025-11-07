const jwt = require('jsonwebtoken');
const Student = require('../models/User');
const Faculty = require('../models/Faculty');
const Admin = require('../models/Admin');

async function auth(req, res, next) {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ msg: 'No token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Try to find user in all collections
    let user =
      (await Student.findById(decoded.id).select('-passwordHash')) ||
      (await Faculty.findById(decoded.id).select('-passwordHash')) ||
      (await Admin.findById(decoded.id).select('-passwordHash'));

    if (!user) return res.status(401).json({ msg: 'User not found' });

    req.user = user; // attach user to request
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Token invalid' });
  }
}

module.exports = auth;
