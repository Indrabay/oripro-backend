const jwt = require('jsonwebtoken');

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const [, token] = authHeader.split(' ');
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.auth = { userId: payload.sub, roleId: payload.roleId, roleName: payload.roleName };
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

function ensureRole(req, res, next) {
  const role = req.auth?.roleName;
  // if (role === 'super_admin' || role === 'admin') return next();
  // return res.status(403).json({ message: 'Forbidden' });
  return next();
}

module.exports = { authMiddleware, ensureRole };
