const { Router } = require('express');
const { body, validationResult, param } = require('express-validator');
const { authMiddleware, ensureRole } = require('../middleware/auth');

function InitRoleRouter(roleUsecase) {
  const router = Router();
  router.use(authMiddleware, ensureRole);

  // GET /api/roles - List all roles
  router.get('/', async (req, res) => {
    req.log?.info({}, 'route_roles_list');
    try {
      const roles = await roleUsecase.listAllRoles({ requestId: req.requestId, log: req.log });
      return res.json(roles);
    } catch (error) {
      req.log?.error({ error: error.message, stack: error.stack }, 'route_roles_list_error');
      
      return res.status(500).json({ 
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // GET /api/roles/:id - Get role by ID
  router.get('/:id', async (req, res) => {
    req.log?.info({ id: req.params.id }, 'route_roles_get');
    try {
      const role = await roleUsecase.getRoleById(req.params.id, { requestId: req.requestId, log: req.log });
      if (!role) return res.status(404).json({ message: 'Role not found' });
      return res.json(role);
    } catch (error) {
      req.log?.error({ error: error.message }, 'route_roles_get_error');
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  // POST /api/roles - Create new role
  router.post(
    '/',
    [
      body('name').isString().notEmpty().withMessage('Name is required'),
      body('level').isInt({ min: 0 }).withMessage('Level must be a non-negative integer'),
      body('menuPermissions').optional().isArray().withMessage('Menu permissions must be an array'),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      req.log?.info({ name: req.body.name }, 'route_roles_create');
      try {
        const role = await roleUsecase.createRole(req.body, { requestId: req.requestId, log: req.log });
        return res.status(201).json(role);
      } catch (error) {
        req.log?.error({ error: error.message }, 'route_roles_create_error');
        return res.status(500).json({ message: 'Internal Server Error' });
      }
    }
  );

  // PUT /api/roles/:id - Update role
  router.put(
    '/:id',
    [
      param('id').isUUID().withMessage('Invalid role ID'),
      body('name').optional().isString().notEmpty().withMessage('Name cannot be empty'),
      body('level').optional().isInt({ min: 0 }).withMessage('Level must be a non-negative integer'),
      body('menuPermissions').optional().isArray().withMessage('Menu permissions must be an array'),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      req.log?.info({ id: req.params.id }, 'route_roles_update');
      try {
        const role = await roleUsecase.updateRole(req.params.id, req.body, { requestId: req.requestId, log: req.log });
        if (!role) return res.status(404).json({ message: 'Role not found' });
        return res.json(role);
      } catch (error) {
        req.log?.error({ error: error.message }, 'route_roles_update_error');
        return res.status(500).json({ message: 'Internal Server Error' });
      }
    }
  );

  // DELETE /api/roles/:id - Delete role
  router.delete(
    '/:id',
    [
      param('id').isUUID().withMessage('Invalid role ID'),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      req.log?.info({ id: req.params.id }, 'route_roles_delete');
      try {
        const deleted = await roleUsecase.deleteRole(req.params.id, { requestId: req.requestId, log: req.log });
        if (!deleted) return res.status(404).json({ message: 'Role not found' });
        return res.status(204).send();
      } catch (error) {
        req.log?.error({ error: error.message }, 'route_roles_delete_error');
        return res.status(500).json({ message: 'Internal Server Error' });
      }
    }
  );

  // GET /api/roles/:id/menu-permissions - Get role menu permissions
  router.get(
    '/:id/menu-permissions',
    [
      param('id').isUUID().withMessage('Invalid role ID'),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      req.log?.info({ id: req.params.id }, 'route_roles_get_menu_permissions');
      try {
        const permissions = await roleUsecase.getRoleMenuPermissions(req.params.id, { requestId: req.requestId, log: req.log });
        return res.json(permissions);
      } catch (error) {
        req.log?.error({ error: error.message }, 'route_roles_get_menu_permissions_error');
        return res.status(500).json({ message: 'Internal Server Error' });
      }
    }
  );

  // PUT /api/roles/:id/menu-permissions - Set role menu permissions
  router.put(
    '/:id/menu-permissions',
    [
      param('id').isUUID().withMessage('Invalid role ID'),
      body('permissions').isArray().withMessage('Permissions must be an array'),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      req.log?.info({ id: req.params.id }, 'route_roles_set_menu_permissions');
      try {
        await roleUsecase.setRoleMenuPermissions(req.params.id, req.body.permissions, { requestId: req.requestId, log: req.log });
        return res.status(204).send();
      } catch (error) {
        req.log?.error({ error: error.message }, 'route_roles_set_menu_permissions_error');
        return res.status(500).json({ message: 'Internal Server Error' });
      }
    }
  );

  return router;
}

module.exports = { InitRoleRouter };
