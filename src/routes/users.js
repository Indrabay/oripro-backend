const { Router } = require('express');
const { body, validationResult, param } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');
const { PostgresUserRepository } = require('../repositories/PostgresUserRepository');
const { MySqlUserRepository } = require('../repositories/MySqlUserRepository');

function buildUserRepository() {
  const dbType = (process.env.DB_TYPE || 'postgres').toLowerCase();
  if (dbType === 'mysql') return new MySqlUserRepository();
  return new PostgresUserRepository();
}

const userRepository = buildUserRepository();
const router = Router();

function ensureRole(req, res, next) {
  const role = req.auth?.roleName;
  console.log(role);
  if (role === 'super_admin' || role === 'admin') return next();
  return res.status(403).json({ message: 'Forbidden' });
}

router.use(authMiddleware, ensureRole);

// GET /api/users - List all users
router.get('/', async (req, res) => {
  req.log?.info({}, 'route_users_list');
  try {
    if (req.auth.roleName === 'super_admin') {
      // Super admin bisa melihat semua users
      const users = await userRepository.listAll({ requestId: req.requestId, log: req.log });
      // Jangan return password untuk semua users
      const usersWithoutPassword = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      return res.json(usersWithoutPassword);
    }
    // Admin hanya bisa melihat user yang terkait dengan asset yang mereka kelola
    // Untuk sementara, admin tidak bisa melihat list users
    return res.status(403).json({ message: 'Admin cannot list all users' });
  } catch (error) {
    req.log?.error({ error: error.message }, 'route_users_list_error');
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

// GET /api/users/:id - Get user by ID
router.get(
  '/:id',
  [param('id').isString().notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    
    req.log?.info({ id: req.params.id }, 'route_users_get');
    try {
      const user = await userRepository.findById(req.params.id, { requestId: req.requestId, log: req.log });
      if (!user) return res.status(404).json({ message: 'User not found' });
      
      // Super admin bisa melihat semua users, admin hanya bisa melihat user tertentu
      if (req.auth.roleName !== 'super_admin') {
        // Untuk admin, kita bisa menambahkan logika tambahan di sini
        // misalnya hanya bisa melihat user yang terkait dengan asset mereka
      }
      
      // Jangan return password
      const { password, ...userWithoutPassword } = user;
      return res.json(userWithoutPassword);
    } catch (error) {
      req.log?.error({ error: error.message }, 'route_users_get_error');
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
);

// POST /api/users - Create new user
router.post(
  '/',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').optional().isString().notEmpty(),
    body('roleId').optional().isString().notEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    
    const { email, password, name, roleId } = req.body;
    req.log?.info({ email }, 'route_users_create');
    
    try {
      // Check if user already exists
      const existingUser = await userRepository.findByEmail(email, { requestId: req.requestId, log: req.log });
      if (existingUser) {
        return res.status(409).json({ message: 'User with this email already exists' });
      }
      
      const user = await userRepository.create({
        email,
        password,
        name,
        roleId,
        createdBy: req.auth.userId
      }, { requestId: req.requestId, log: req.log });
      
      // Don't return password
      const { password: _, ...userWithoutPassword } = user;
      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      req.log?.error({ error: error.message }, 'route_users_create_error');
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
);

// PUT /api/users/:id - Update user
router.put(
  '/:id',
  [
    param('id').isString().notEmpty(),
    body('email').optional().isEmail().normalizeEmail(),
    body('name').optional().isString().notEmpty(),
    body('roleId').optional().isString().notEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    
    req.log?.info({ id: req.params.id }, 'route_users_update');
    try {
      const user = await userRepository.findById(req.params.id, { requestId: req.requestId, log: req.log });
      if (!user) return res.status(404).json({ message: 'User not found' });
      
      // Super admin bisa update semua users, admin hanya bisa update user tertentu
      if (req.auth.roleName !== 'super_admin') {
        // Untuk admin, kita bisa menambahkan logika tambahan di sini
        // misalnya hanya bisa update user yang terkait dengan asset mereka
      }
      
      // Check if email is being updated and if it already exists
      if (req.body.email && req.body.email !== user.email) {
        const existingUser = await userRepository.findByEmail(req.body.email, { requestId: req.requestId, log: req.log });
        if (existingUser) {
          return res.status(409).json({ message: 'User with this email already exists' });
        }
      }
      
      // Update user
      const updatedUser = await userRepository.update(req.params.id, { 
        ...req.body, 
        updatedBy: req.auth.userId 
      }, { requestId: req.requestId, log: req.log });
      
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Jangan return password
      const { password, ...userWithoutPassword } = updatedUser;
      return res.json(userWithoutPassword);
    } catch (error) {
      req.log?.error({ error: error.message }, 'route_users_update_error');
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
);

// DELETE /api/users/:id - Delete user
router.delete(
  '/:id',
  [param('id').isString().notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    
    req.log?.info({ id: req.params.id }, 'route_users_delete');
    try {
      const user = await userRepository.findById(req.params.id, { requestId: req.requestId, log: req.log });
      if (!user) return res.status(404).json({ message: 'User not found' });
      
      // Super admin bisa delete semua users, admin hanya bisa delete user tertentu
      if (req.auth.roleName !== 'super_admin') {
        // Untuk admin, kita bisa menambahkan logika tambahan di sini
        // misalnya hanya bisa delete user yang terkait dengan asset mereka
      }
      
      // Prevent self-deletion
      if (user.id === req.auth.userId) {
        return res.status(400).json({ message: 'Cannot delete your own account' });
      }
      
      // Delete user
      const deleted = await userRepository.delete(req.params.id, { requestId: req.requestId, log: req.log });
      if (!deleted) {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.status(204).send();
    } catch (error) {
      req.log?.error({ error: error.message }, 'route_users_delete_error');
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
);

module.exports = router;
