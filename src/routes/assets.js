const { Router } = require('express');
const { body, validationResult, param } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');

function ensureRole(req, res, next) {
  const role = req.auth?.roleName;
  if (role === 'super_admin' || role === 'admin') return next();
  return res.status(403).json({ message: 'Forbidden' });
}

function InitAssetRouter(AssetUsecase) {
  const router = Router();

  router.use(authMiddleware, ensureRole);

  router.post(
    '/',
    [
      body('name').isString().notEmpty(),
      body('asset_type').isInt().notEmpty(),
      body('code').isString().notEmpty(),
      body('address').isString().notEmpty(),
      body('area').isFloat().notEmpty(),
      body('status').optional().isInt(),
      body('description').optional().isString(),
      body('longitude').isFloat({ min: -180, max: 180 }).notEmpty(),
      body('latitude').isFloat({ min: -90, max: 90 }).notEmpty()
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const { name, asset_type, code, address, area, status, description, longitude, latitude } = req.body;
      req.log?.info({ name }, 'route_assets_create');
      const asset = await AssetUsecase.createAsset({
        name,
        description,
        asset_type,
        code,
        address,
        area,
        status: status ? status : 1,
        longitude,
        latitude,
        createdBy: req.auth.userId
      }, { requestId: req.requestId, log: req.log, roleName: req.auth.roleName });
      return res.status(201).json(asset);
    }
  );

  router.get('/', async (req, res) => {
    req.log?.info({}, 'route_assets_list');
    const assets = await AssetUsecase.listAssets({ requestId: req.requestId, log: req.log, roleName: req.auth.roleName, userId: req.auth.userId });
    return res.json(assets);
  });

  router.get(
    '/:id',
    [param('id').isString().notEmpty()],
    async (req, res) => {
      req.log?.info({ id: req.params.id }, 'route_assets_get');
      const asset = await AssetUsecase.getAsset(req.params.id, { requestId: req.requestId, log: req.log, roleName: req.auth.roleName, userId: req.auth.userId });
      if (!asset) return res.status(404).json({ message: 'Not found' });
      if (asset === 'forbidden') return res.status(403).json({ message: 'Forbidden' });
      return res.json(asset);
    }
  );

  router.put(
    '/:id',
    [
      param('id').isString().notEmpty(),
      body('name').optional().isString(),
      body('address').optional().isString(),
      body('description').optional().isString(),
      body('area').optional().isFloat(),
      body('status').optional().isInt(),
      body('aset_type').optional().isInt(),
      body('longitude').optional().isFloat({ min: -180, max: 180 }),
      body('latitude').optional().isFloat({ min: -90, max: 90 })
    ],
    async (req, res) => {
      req.log?.info({ id: req.params.id }, 'route_assets_update');
      const updated = await AssetUsecase.updateAsset(req.params.id, req.body, { requestId: req.requestId, log: req.log, roleName: req.auth.roleName, userId: req.auth.userId });
      if (!updated) return res.status(404).json({ message: 'Not found' });
      if (updated === 'forbidden') return res.status(403).json({ message: 'Forbidden' });
      return res.json(updated);
    }
  );

  router.delete(
    '/:id',
    [param('id').isString().notEmpty()],
    async (req, res) => {
      req.log?.info({ id: req.params.id }, 'route_assets_delete');
      const deleted = await AssetUsecase.deleteAsset(req.params.id, { requestId: req.requestId, log: req.log, roleName: req.auth.roleName, userId: req.auth.userId });
      if (!deleted) return res.status(404).json({ message: 'Not found' });
      if (deleted === 'forbidden') return res.status(403).json({ message: 'Forbidden' });
      return res.status(204).send();
    }
  );

  return router;
}

module.exports = { InitAssetRouter };


