const { Router } = require('express');
const { body, validationResult, param } = require('express-validator');
const { authMiddleware, ensureRole } = require('../middleware/auth');
const { createResponse } = require('../services/response');

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
      body('rent_duration').isNumeric(),
      body('rent_duration_unit').notEmpty().isString(),
      body('user_id').notEmpty().isString(),
      body('categories').notEmpty().isArray(),
    ],
    async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json(createResponse(null, "bad request", 400, false, {}, errors));
      const {
        name,
        tenant_identifications,
        contract_documents,
        unit_ids,
        contract_begin_at,
        rent_duration,
        rent_duration_unit,
        categories,
        user_id,
      } = req.body;
      const tenant = await TenantUseCase.createTenant({
        name, tenant_identifications, contract_documents, contract_begin_at, unit_ids, rent_duration, rent_duration_unit, user_id, categories,createdBy: req.auth.userId
      }, {userId: req.auth.userId});
      res.status(201).json(createResponse(tenant, "success", 201));
    } catch (err) {
      res.status(400).json(createResponse(null, "failed", 400, false, {}, err));
    }
  });

  router.get('/', async (req, res) => {
    let limit = req.query.limit ? parseInt(req.query.limit) : 10
    let offset = req.query.offset ? parseInt(req.query.offset) : 0

    req.query.limit = limit
    req.query.offset = offset
    try {
      const data = await TenantUseCase.getAllTenants(req.query);
      res.status(200).json(createResponse(data.tenants, "success", 200, true, {
        total: data.total,
        limit: limit,
        offset: offset
      }));
    } catch (err) {
      res.status(500).json(createResponse(null, "internal server error", 500, false, {}, err));
    }
  });

  router.get('/:id', async (req, res) => {
    try {
      const tenant = await TenantUseCase.getTenantById(req.params.id);
      if (!tenant) {
        return res.status(404).json(createResponse(null, "not found", 404));
      }
      res.status(200).json(createResponse(tenant, "success", 200));
    } catch (err) {
      res.status(500).json(createResponse(null, "internal server error", 500));
    }
  });

  router.put('/:id', async (req, res) => {
    try {
      const updated = await TenantUseCase.updateTenant(req.params.id, req.body);
      res.status(202).json(createResponse(updated, "success", 202));
    } catch (err) {
      res.status(500).json(createResponse(null, "internal server error", 500));
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

  router.get('/:id/logs', async (req, res) => {
    try {
      const tenantLogs = await TenantUseCase.getTenantLogs(req.params.id, {
        userId: req.auth.userId
      })

      res.status(200).json(createResponse(tenantLogs, "success", 200, true, {
        total: tenantLogs.length,
        limit: tenantLogs.length,
        offset: 0
      }));
    } catch (err) {
      console.log(err)
      res.status(500).json(createResponse(null, "internal server error", 500))
    }
  })

  return router;
}

module.exports = {InitTenantRouter};