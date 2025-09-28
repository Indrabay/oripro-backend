const { Router } = require("express");
const { body, validationResult, param } = require("express-validator");
const { authMiddleware, ensureRole } = require("../middleware/auth");

function InitAssetRouter(AssetUsecase) {
  const router = Router();

  router.use(authMiddleware, ensureRole);

  router.post(
    "/",
    [
      body("name").isString().notEmpty(),
      body("asset_type").isInt().notEmpty(),
      body("code").isString().notEmpty(),
      body("address").isString().notEmpty(),
      body("area").isFloat().notEmpty(),
      body("status").optional().isInt(),
      body("sketch").optional(),
      body("photos").optional().isArray(),
      body("description").optional().isString(),
      body("longitude").isFloat({ min: -180, max: 180 }).notEmpty(),
      body("latitude").isFloat({ min: -90, max: 90 }).notEmpty(),
    ],
    createAsset
  );

  router.get("/", async (req, res) => {
    const { name, asset_type, order, limit, offset } = req.query;
    req.log?.info({}, "route_assets_list");
    const assets = await AssetUsecase.listAssets({
      name,
      asset_type,
      order,
      limit,
      offset
    },{
      requestId: req.requestId,
      log: req.log,
      roleName: req.auth.roleName,
      userId: req.auth.userId,
    });
    return res.json(assets);
  });

  router.get("/:id", [param("id").isString().notEmpty()], getDetailAsset);

  router.put(
    "/:id",
    [
      param("id").isString().notEmpty(),
      body("name").optional().isString(),
      body("address").optional().isString(),
      body("description").optional().isString(),
      body("area").optional().isFloat(),
      body("status").optional().isInt(),
      body("aset_type").optional().isInt(),
      body("longitude").optional().isFloat({ min: -180, max: 180 }),
      body("latitude").optional().isFloat({ min: -90, max: 90 }),
    ],
    async (req, res) => {
      req.log?.info({ id: req.params.id }, "route_assets_update");
      const updated = await AssetUsecase.updateAsset(req.params.id, req.body, {
        requestId: req.requestId,
        log: req.log,
        roleName: req.auth.roleName,
        userID: req.auth.userId,
      });
      if (!updated) return res.status(404).json({ message: "Not found" });
      if (updated === "forbidden")
        return res.status(403).json({ message: "Forbidden" });
      return res.json(updated);
    }
  );

  async function createAsset(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    const {
      name,
      asset_type,
      code,
      address,
      area,
      status,
      description,
      longitude,
      latitude,
      sketch,
      photos,
    } = req.body;
    req.log?.info({ name }, "route_assets_create");
    const asset = await AssetUsecase.createAsset(
      {
        name,
        description,
        asset_type,
        code,
        address,
        area,
        status: status ? status : 1,
        is_deleted: false,
        longitude,
        latitude,
        sketch,
        photos,
        createdBy: req.auth.userId,
      },
      {
        requestId: req.requestId,
        log: req.log,
        roleName: req.auth.roleName,
        userID: req.auth.userId,
      }
    );
    return res.status(201).json(asset);
  }

  router.get('/', async (req, res) => {
    req.log?.info({}, 'route_assets_list');
    try {
      const assets = await AssetUsecase.listAssets({ requestId: req.requestId, log: req.log, roleName: req.auth.roleName, userId: req.auth.userId });
      return res.json(assets);
    } catch (error) {
      req.log?.error({ error: error.message, stack: error.stack }, 'route_assets_list_error');
      
      // Return mock data for development/testing
      if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV !== 'production') {
        req.log?.info({}, 'returning_mock_assets_data');
        return res.json([
          {
            id: '1',
            name: 'Gedung A',
            asset_type: 1,
            code: 'GA001',
            address: 'Jl. Contoh No. 1',
            area: 1000.5,
            status: 1,
            description: 'Gedung perkantoran',
            longitude: 106.8456,
            latitude: -6.2088,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '2',
            name: 'Gedung B',
            asset_type: 2,
            code: 'GB001',
            address: 'Jl. Contoh No. 2',
            area: 2000.0,
            status: 1,
            description: 'Gedung komersial',
            longitude: 106.8500,
            latitude: -6.2100,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);
      }
      
      return res.status(500).json({ 
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
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
      return res.status(204).send();
    }
  );
  async function getDetailAsset(req, res) {
    req.log?.info({ id: req.params.id }, "route_assets_get");
    const asset = await AssetUsecase.getAsset(req.params.id, {
      requestId: req.requestId,
      log: req.log,
      roleName: req.auth.roleName,
      userId: req.auth.userId,
    });
    if (!asset) return res.status(404).json({ message: "Not found" });
    if (asset === "forbidden")
      return res.status(403).json({ message: "Forbidden" });
    return res.json(asset);
  }

  return router;
}

module.exports = { InitAssetRouter };
