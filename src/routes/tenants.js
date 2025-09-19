const { Router } = require('express');
const { body, validationResult, param } = require('express-validator');
const { authMiddleware, ensureRole } = require('../middleware/auth');

function InitTenantRouter(TenantUseCase) {
  const router = Router();

  router.use(authMiddleware, ensureRole);

  router.post(
    '/', 
    [
      body('name').isString().notEmpty(),
      body('tenant_identifications').notEmpty().isArray(),
      body('contract_documents').notEmpty().isArray(),
      body('unit_ids').notEmpty().isArray(),
      body('contract_begin_at').notEmpty(),
      body('rent_duration').notEmpty().isNumeric(),
      body('rent_duration_unit').notEmpty().isString(),
      body('user_id').notEmpty().isString(),
    ],
    async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const {
        name,
        tenant_identifications,
        contract_documents,
        unit_ids,
        contract_begin_at,
        rent_duration,
        rent_duration_unit,
        user_id,
      } = req.body;
      const tenant = await TenantUseCase.createTenant({
        name, tenant_identifications, contract_documents, contract_begin_at,
        unit_ids, rent_duration, rent_duration_unit, user_id,
        createdBy: req.auth.userId
      });
      res.status(201).json(tenant);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  router.get('/', async (req, res) => {
    try {
      const tenants = await TenantUseCase.getAllTenants();
      res.json(tenants);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

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

  router.put('/:id', async (req, res) => {
    try {
      const updated = await TenantUseCase.updateTenant(req.params.id, req.body);
      res.json(updated);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

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