const { Router } = require('express');
const { body, validationResult, param } = require('express-validator');
const { authMiddleware, ensureRole } = require('../middleware/auth');

function InitUserRouter(userUsecase) {
  const router = Router();
  router.use(authMiddleware, ensureRole);

  // GET /api/users - List all users
  router.get('/', async (req, res) => {
    req.log?.info({}, 'route_users_list');
    try {
      const users = await userUsecase.listUsers({ requestId: req.requestId, log: req.log, roleName: req.auth.roleName });
      if (users === 'forbidden') return res.status(403).json({ message: 'Admin cannot list all users' });
      return res.json(users);
    } catch (error) {
      req.log?.error({ error: error.message, stack: error.stack }, 'route_users_list_error');
      
      return res.status(500).json({ 
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
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
        const user = await userUsecase.getUser(req.params.id, { requestId: req.requestId, log: req.log, roleName: req.auth.roleName });
        if (!user) return res.status(404).json({ message: 'User not found' });
        return res.json(user);
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
      body('status').optional().isIn(['active', 'inactive', 'pending', 'suspended']),
      body('roleId').optional().isString().notEmpty()
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      req.log?.info({ email: req.body.email }, 'route_users_create');
      try {
        const user = await userUsecase.createUser(req.body, { requestId: req.requestId, log: req.log, userId: req.auth.userId });
        if (user === 'exists') return res.status(409).json({ message: 'User with this email already exists' });
        return res.status(201).json(user);
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
      body('status').optional().isIn(['active', 'inactive', 'pending', 'suspended']),
      body('roleId').optional().isString().notEmpty()
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      req.log?.info({ id: req.params.id }, 'route_users_update');
      try {
        const updatedUser = await userUsecase.updateUser(req.params.id, req.body, { requestId: req.requestId, log: req.log, userId: req.auth.userId });
        if (!updatedUser) return res.status(404).json({ message: 'User not found' });
        if (updatedUser === 'exists') return res.status(409).json({ message: 'User with this email already exists' });
        return res.json(updatedUser);
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
        const deleted = await userUsecase.deleteUser(req.params.id, { requestId: req.requestId, log: req.log, userId: req.auth.userId });
        if (!deleted) return res.status(404).json({ message: 'User not found' });
        if (deleted === 'self') return res.status(400).json({ message: 'Cannot delete your own account' });
        return res.status(204).send();
      } catch (error) {
        req.log?.error({ error: error.message }, 'route_users_delete_error');
        return res.status(500).json({ message: 'Internal Server Error' });
      }
    }
  );

  // GET /api/users/permissions - Get current user permissions
  router.get('/permissions', async (req, res) => {
    req.log?.info({ userId: req.auth.userId }, 'route_users_permissions');
    try {
      const permissions = await userUsecase.getUserPermissions(req.auth.userId, { requestId: req.requestId, log: req.log });
      return res.json({ permissions });
    } catch (error) {
      req.log?.error({ error: error.message }, 'route_users_permissions_error');
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  return router;
}

module.exports = { InitUserRouter };
