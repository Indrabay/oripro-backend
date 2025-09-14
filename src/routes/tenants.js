const { Router } = require('express');
const { body, validationResult, param } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');

function ensureRole(req, res, next) {
  const role = req.auth?.roleName;
  if (role === 'super_admin') return next();
  return res.status(403).json({ message: 'Forbidden' });
}

function InitTenantRouter(tenantUsecase) {
  const router = Router();

  router.use(authMiddleware, ensureRole);

  // POST /api/tenants - Create new tenant
  router.post(
    '/',
    [
      body('name').isString().notEmpty(),
      body('domain').isString().notEmpty().isFQDN(),
      body('adminEmail').isEmail().normalizeEmail(),
      body('adminPassword').isLength({ min: 6 })
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const { name, domain, adminEmail, adminPassword } = req.body;
      req.log?.info({ name }, 'route_tenants_create');
      try {
        const tenant = await tenantUsecase.create({ name, domain, adminEmail, adminPassword }, { requestId: req.requestId, log: req.log });
        return res.status(201).json(tenant);
      } catch (error) {
        req.log?.error({ error: error.message }, 'route_tenants_create_error');
        if (error.message === 'Tenant with this domain already exists') {
          return res.status(409).json({ message: error.message });
        }
        return res.status(500).json({ message: 'Internal Server Error' });
      }
    }
  );

  // GET /api/tenants - List all tenants
  router.get('/', async (req, res) => {
    req.log?.info({}, 'route_tenants_list');
    try {
      const tenants = await tenantUsecase.listAll({ requestId: req.requestId, log: req.log });
      return res.json(tenants);
    } catch (error) {
      req.log?.error({ error: error.message }, 'route_tenants_list_error');
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  // GET /api/tenants/:id - Get tenant by ID
  router.get(
    '/:id',
    [param('id').isString().notEmpty()],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const { id } = req.params;
      req.log?.info({ id }, 'route_tenants_get');
      try {
        const tenant = await tenantUsecase.findById({ id }, { requestId: req.requestId, log: req.log });
        if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
        return res.json(tenant);
      } catch (error) {
        req.log?.error({ error: error.message }, 'route_tenants_get_error');
        return res.status(500).json({ message: 'Internal Server Error' });
      }
    }
  );

  // PUT /api/tenants/:id - Update tenant by ID
  router.put(
    '/:id',
    [
      param('id').isString().notEmpty(),
      body('name').optional().isString().notEmpty(),
      body('domain').optional().isString().notEmpty().isFQDN()
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const { id } = req.params;
      const { name, domain } = req.body;
      req.log?.info({ id }, 'route_tenants_update');
      try {
        const tenant = await tenantUsecase.update(id, { name, domain }, { requestId: req.requestId, log: req.log });
        if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
        return res.json(tenant);
      } catch (error) {
        req.log?.error({ error: error.message }, 'route_tenants_update_error');
        if (error.message === 'Tenant with this domain already exists') {
          return res.status(409).json({ message: error.message });
        }
        return res.status(500).json({ message: 'Internal Server Error' });
      }
    }
  );

  // DELETE /api/tenants/:id - Delete tenant by ID
  router.delete(
    '/:id',
    [param('id').isString().notEmpty()],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const { id } = req.params;
      req.log?.info({ id }, 'route_tenants_delete');
      try {
        const success = await tenantUsecase.delete(id, { requestId: req.requestId, log: req.log });
        if (!success) return res.status(404).json({ message: 'Tenant not found' });
        return res.status(204).send();
      } catch (error) {
        req.log?.error({ error: error.message }, 'route_tenants_delete_error');
        return res.status(500).json({ message: 'Internal Server Error' });
      }
    }
  );

  return router;
}

module.exports = InitTenantRouter;