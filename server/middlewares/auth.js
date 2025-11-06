const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function auth(req,res,next){
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ msg: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-passwordHash');
    next();
  } catch (err){ return res.status(401).json({ msg: 'Token invalid' }); }
}
module.exports = auth;
