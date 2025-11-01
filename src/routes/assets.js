const { Router } = require("express");
const { body, validationResult, param } = require("express-validator");
const { authMiddleware, ensureRole } = require("../middleware/auth");
const { createResponse } = require("../services/response");
const uploadMiddleware = require("../middleware/uploader");

function InitAssetRouter(AssetUsecase) {
  const router = Router();

  const createAssetParam = [
    body("name").isString().notEmpty().trim(),
    body("asset_type").isInt().notEmpty(),
    body("address").isString().notEmpty().trim(),
    body("area").isFloat().notEmpty(),
    body("status").optional().isInt(),
    body("description").optional().isString().trim(),
    body("longitude").isFloat({ min: -180, max: 180 }).notEmpty(),
    body("latitude").isFloat({ min: -90, max: 90 }).notEmpty(),
  ];

  router.use(authMiddleware, ensureRole);

  router.post("/", uploadMiddleware, createAssetParam, createAsset);

  router.get("/", async (req, res) => {
    try {
      let { name, asset_type, order, limit, offset } = req.query;
      if (!limit) limit = 10;
      if (!offset) offset = 0;

      req.log?.info({}, "route_assets_list");
      const assets = await AssetUsecase.listAssets(
        {
          name,
          asset_type,
          order,
          limit,
          offset,
        },
        {
          requestId: req.requestId,
          log: req.log,
          roleName: req.auth.roleName,
          userId: req.auth.userId,
        }
      );
      return res
        .status(200)
        .json(
          createResponse(
            assets.assets,
            "Assets fetched successfully",
            200,
            true,
            { total: assets.total, limit: limit, offset: offset }
          )
        );
    } catch (error) {
      req.log?.error(error, "route_assets_list_error");
      return res
        .status(500)
        .json(createResponse(null, "internal server error", 500));
    }
  });

  router.get("/:id", [param("id").isString().notEmpty()], getDetailAsset);

  router.get("/:id/logs", [param("id").isString().notEmpty()], getAssetLog);

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
      if (!updated)
        return res.status(404).json(createResponse(null, "not found", 404));
      if (updated === "forbidden")
        return res.status(403).json(createResponse(null, "forbidden", 403));
      return res.status(202).json(createResponse(updated, "success", 202));
    }
  );

  async function createAsset(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res
        .status(400)
        .json(createResponse(null, "bad request", 400, false, {}, errors));
    }
    
    const {
      name,
      asset_type,
      address,
      area,
      status,
      description,
      longitude,
      latitude,
    } = req.body;
    
    // Generate unique code for asset
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    const code = `AST-${timestamp}-${randomSuffix}`;
    
    console.log('Received data:', {
      name,
      code,
      asset_type,
      address,
      area,
      status,
      description,
      longitude,
      latitude
    });
    
    // Handle file uploads
    let photos = [];
    let sketch = null;
    
    if (req.files) {
      const host = req.protocol + '://' + req.get('host');
      
      // Handle photos
      if (req.files.photos && req.files.photos.length > 0) {
        req.files.photos.forEach((file) => {
          const relativePath = file.path.split('uploads')[1].replace(/\\/g, '/');
          const urlPath = `${host}/uploads${relativePath}`;
          photos.push(urlPath);
        });
      }
      
      // Handle sketch
      if (req.files.sketch && req.files.sketch.length > 0) {
        const file = req.files.sketch[0];
        const relativePath = file.path.split('uploads')[1].replace(/\\/g, '/');
        const urlPath = `${host}/uploads${relativePath}`;
        sketch = urlPath;
      }
    }
    
    req.log?.info({ name }, "route_assets_create");
    const asset = await AssetUsecase.createAsset(
      {
        name,
        code,
        description,
        asset_type,
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
    return res
      .status(201)
      .json(createResponse(asset, "Asset created successfully", 201));
  }

  async function getDetailAsset(req, res) {
    req.log?.info({ id: req.params.id }, "route_assets_get");
    const asset = await AssetUsecase.getAsset(req.params.id, {
      requestId: req.requestId,
      log: req.log,
      roleName: req.auth.roleName,
      userId: req.auth.userId,
    });
    if (!asset)
      return res.status(404).json(createResponse(null, "not found", 404));
    if (asset === "forbidden")
      return res.status(403).json(createResponse(null, "forbidden", 403));
    return res
      .status(200)
      .json(createResponse(asset, "Asset fetched successfully", 200));
  }

  async function getAssetLog(req, res) {
    req.log?.info({ id: req.params.id }, "AssetRouter.getAssetLog");
    const assetLogs = await AssetUsecase.getAssetLogs(req.params.id, {
      requestId: req.requestId,
      log: req.log,
      userId: req.auth.userId
    })

    if (!assetLogs) {
      return res.status(404).json(createResponse(null, "not found", 404))
    }

    return res.status(200).json(createResponse(assetLogs, "success", 200, true, {
      total: assetLogs.length,
      limit: assetLogs.length,
      offset: 0
    }))
  }

  return router;
}

module.exports = { InitAssetRouter };
