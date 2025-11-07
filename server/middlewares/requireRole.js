module.exports = function requireRole(role){
  return (req,res,next) => {
    if (!req.user) return res.status(401).send('Unauthorized');
    if (req.user.role !== role && req.user.role !== 'admin') return res.status(403).send('Forbidden');
    next();
  }
}
