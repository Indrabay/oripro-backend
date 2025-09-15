const { Router } = require('express');
const { body, validationResult, param } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');

// Create a new tenant
function ensureRole(req, res, next) {
  const role = req.auth?.roleName;
  if (role === 'super_admin' || role === 'admin') return next();
  return res.status(403).json({ message: 'Forbidden' });
}
function InitTenantRouter(TenantUseCase) {
  const router = Router();

  router.use(authMiddleware, ensureRole);

  router.post('/', async (req, res) => {
    try {
      const tenant = await TenantUseCase.createTenant(req.body);
      res.status(201).json(tenant);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // Get all tenants
  router.get('/', async (req, res) => {
    try {
      const tenants = await TenantUseCase.getAllTenants();
      res.json(tenants);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get tenant by ID
  router.get('/:id', async (req, res) => {
    try {
      const tenant = await TenantUseCase.getTenantById(req.params.id);
      if (!tenant) {
        return res.status(404).json({ error: 'Tenant not found' });
      }
      res.json(tenant);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update tenant
  router.put('/:id', async (req, res) => {
    try {
      const updated = await TenantUseCase.updateTenant(req.params.id, req.body);
      res.json(updated);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // Delete tenant
  router.delete('/:id', async (req, res) => {
    try {
      await TenantUseCase.deleteTenant(req.params.id);
      res.status(204).send();
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  return router;
}


module.exports = {InitTenantRouter};