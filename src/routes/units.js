const { Router } = require('express');
const { body, validationResult, param } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');

function ensureRole(req, res, next) {
  const role = req.auth?.roleName;
  if (role === 'super_admin' || role === 'admin') return next();
  return res.status(403).json({ message: 'Forbidden' });
}

function InitUnitRouter(UnitUsecase) {
  const router = Router();

  router.use(authMiddleware, ensureRole);

  router.post(
    '/',
    [
      body('name').isString().notEmpty(),
      body('asset_id').isUUID().notEmpty(),
      body('code').isString().notEmpty(),
      body('description').optional().isString(),
      body('area').isFloat().notEmpty(),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const { name, asset_id, code, description, area } = req.body;
      req.log?.info({ name }, 'route_units_create');
      const unit = await UnitUsecase.createUnit({
        name,
        asset_id,
        code,
        description,
        area,
        createdBy: req.auth.userId
      }, { requestId: req.requestId, log: req.log, roleName: req.auth.roleName });
      return res.status(201).json(unit);
    }
  );

  router.get('/', async (req, res) => {
    req.log?.info({}, 'route_units_list');
    const units = await UnitUsecase.listUnits({ requestId: req.requestId, log: req.log, roleName: req.auth.roleName, userId: req.auth.userId });
    return res.json(units);
  });

  router.get(
    '/:id',
    [param('id').isString().notEmpty()],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      req.log?.info({ id: req.params.id }, 'route_units_get');
      try {
        const unit = await UnitUsecase.getUnitById(req.params.id, { requestId: req.requestId, log: req.log, roleName: req.auth.roleName });
        if (!unit) return res.status(404).json({ message: 'Unit not found' });
        return res.json(unit);
      } catch (error) {
        req.log?.error({ error: error.message }, 'route_units_get_error');
        return res.status(500).json({ message: 'Internal Server Error' });
      }
    }
  );

  router.put(
    '/:id',
    [
      param('id').isString().notEmpty(),
      body('name').optional().isString().notEmpty(),
      body('area').optional().isFloat().notEmpty(),
      body('description').optional().isString()
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const { name, area, description } = req.body;
      req.log?.info({ id: req.params.id }, 'route_units_update');
      try {
        const unit = await UnitUsecase.updateUnit(req.params.id, {
          name,
          area,
          description,
          updatedBy: req.auth.userId
        }, { requestId: req.requestId, log: req.log, roleName: req.auth.roleName });
        if (!unit) return res.status(404).json({ message: 'Unit not found' });
        return res.json(unit);
      } catch (error) {
        req.log?.error({ error: error.message }, 'route_units_update_error');
        return res.status(500).json({ message: 'Internal Server Error' });
      }
    }
  );

  router.delete(
    '/:id',
    [param('id').isString().notEmpty()],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      req.log?.info({ id: req.params.id }, 'route_units_delete');
      try {
        const success = await UnitUsecase.deleteUnit(req.params.id, { requestId: req.requestId, log: req.log, roleName: req.auth.roleName });
        if (!success) return res.status(404).json({ message: 'Unit not found' });
        return res.status(204).send();
      } catch (error) {
        req.log?.error({ error: error.message }, 'route_units_delete_error');
        return res.status(500).json({ message: 'Internal Server Error' });
      }
    }
  );

  return router;
}

module.exports = {InitUnitRouter};