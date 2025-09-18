const { Router } = require('express');
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
      req.log?.error({ error: error.message }, 'route_roles_list_error');
      return res.status(500).json({ message: 'Internal Server Error' });
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

  return router;
}

module.exports = { InitRoleRouter };
