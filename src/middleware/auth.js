const jwt = require('jsonwebtoken');
const RoleRepository = require('../repositories/RoleRepository');

const roleRepository = new RoleRepository();

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const [, token] = authHeader.split(' ');
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.roleId) {
      // eslint-disable-next-line no-await-in-loop
      role = await roleRepository.findById(payload.roleId, { requestId: req.requestId, log: req.log });
    }
    req.auth = { userId: payload.sub, roleId: payload.roleId || null, roleName: role.name };
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

module.exports = { authMiddleware };


