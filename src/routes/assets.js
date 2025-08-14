const { Router } = require('express');
const { body, validationResult, param } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');
const { PostgresAssetRepository } = require('../repositories/PostgresAssetRepository');
const { MySqlAssetRepository } = require('../repositories/MySqlAssetRepository');

function buildAssetRepository() {
  const dbType = (process.env.DB_TYPE || 'postgres').toLowerCase();
  if (dbType === 'mysql') return new MySqlAssetRepository();
  return new PostgresAssetRepository();
}

const assetRepository = buildAssetRepository();
const router = Router();

function ensureRole(req, res, next) {
  const role = req.auth?.roleName;
  if (role === 'super_admin' || role === 'admin') return next();
  return res.status(403).json({ message: 'Forbidden' });
}

router.use(authMiddleware, ensureRole);

router.post(
  '/',
  [
    body('name').isString().notEmpty(),
    body('description').optional().isString(),
    body('longitude').optional().isFloat({ min: -180, max: 180 }),
    body('latitude').optional().isFloat({ min: -90, max: 90 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { name, description, longitude, latitude } = req.body;
    req.log?.info({ name }, 'route_assets_create');
    const asset = await assetRepository.create({
      name,
      description,
      ownerId: req.auth.userId,
      longitude,
      latitude,
      createdBy: req.auth.userId
    }, { requestId: req.requestId, log: req.log });
    if (req.auth.roleName === 'admin') {
      await assetRepository.assignAdmin(asset.id, req.auth.userId, { requestId: req.requestId, log: req.log });
    }
    return res.status(201).json(asset);
  }
);

router.get('/', async (req, res) => {
  req.log?.info({}, 'route_assets_list');
  if (req.auth.roleName === 'super_admin') {
    const assets = await assetRepository.listAll({ requestId: req.requestId, log: req.log });
    return res.json(assets);
  }
  const assets = await assetRepository.listForAdmin(req.auth.userId, { requestId: req.requestId, log: req.log });
  return res.json(assets);
});

router.get(
  '/:id',
  [param('id').isString().notEmpty()],
  async (req, res) => {
    req.log?.info({ id: req.params.id }, 'route_assets_get');
    const asset = await assetRepository.findById(req.params.id, { requestId: req.requestId, log: req.log });
    if (!asset) return res.status(404).json({ message: 'Not found' });
    if (req.auth.roleName !== 'super_admin') {
      const ok = await assetRepository.isAdminAssigned(asset.id, req.auth.userId, { requestId: req.requestId, log: req.log });
      if (!ok) return res.status(403).json({ message: 'Forbidden' });
    }
    return res.json(asset);
  }
);

router.put(
  '/:id',
  [
    param('id').isString().notEmpty(),
    body('name').optional().isString(),
    body('description').optional().isString(),
    body('longitude').optional().isFloat({ min: -180, max: 180 }),
    body('latitude').optional().isFloat({ min: -90, max: 90 })
  ],
  async (req, res) => {
    req.log?.info({ id: req.params.id }, 'route_assets_update');
    const asset = await assetRepository.findById(req.params.id, { requestId: req.requestId, log: req.log });
    if (!asset) return res.status(404).json({ message: 'Not found' });
    if (req.auth.roleName !== 'super_admin') {
      const ok = await assetRepository.isAdminAssigned(asset.id, req.auth.userId, { requestId: req.requestId, log: req.log });
      if (!ok) return res.status(403).json({ message: 'Forbidden' });
    }
    const updated = await assetRepository.update(asset.id, { ...req.body, updatedBy: req.auth.userId }, { requestId: req.requestId, log: req.log });
    return res.json(updated);
  }
);

router.delete(
  '/:id',
  [param('id').isString().notEmpty()],
  async (req, res) => {
    req.log?.info({ id: req.params.id }, 'route_assets_delete');
    const asset = await assetRepository.findById(req.params.id, { requestId: req.requestId, log: req.log });
    if (!asset) return res.status(404).json({ message: 'Not found' });
    if (req.auth.roleName !== 'super_admin') {
      const ok = await assetRepository.isAdminAssigned(asset.id, req.auth.userId, { requestId: req.requestId, log: req.log });
      if (!ok) return res.status(403).json({ message: 'Forbidden' });
    }
    await assetRepository.delete(asset.id, { requestId: req.requestId, log: req.log });
    return res.status(204).send();
  }
);

module.exports = router;


