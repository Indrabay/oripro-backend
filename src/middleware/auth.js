const jwt = require('jsonwebtoken');
const { PostgresRoleRepository } = require('../repositories/PostgresRoleRepository');
const { MySqlRoleRepository } = require('../repositories/MySqlRoleRepository');

function buildRoleRepository() {
  const dbType = (process.env.DB_TYPE || 'postgres').toLowerCase();
  if (dbType === 'mysql') return new MySqlRoleRepository();
  return new PostgresRoleRepository();
}

const roleRepository = buildRoleRepository();

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const [, token] = authHeader.split(' ');
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    let roleName = null;
    if (payload.roleId) {
      // eslint-disable-next-line no-await-in-loop
      roleName = await roleRepository.findNameById(payload.roleId);
    }
    req.auth = { userId: payload.sub, roleId: payload.roleId || null, roleName };
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

module.exports = { authMiddleware };


