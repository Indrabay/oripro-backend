const { Router } = require("express");
const { body, validationResult, param } = require("express-validator");
const { authMiddleware, ensureRole } = require("../middleware/auth");
const { createResponse } = require("../services/response");

function InitAssetRouter(AssetUsecase) {
  const router = Router();

  const createAssetParam = [
    body("name").isString().notEmpty(),
    body("asset_type").isInt().notEmpty(),
    body("address").isString().notEmpty(),
    body("area").isFloat().notEmpty(),
    body("status").optional().isInt(),
    body("sketch").optional(),
    body("photos").optional().isArray(),
    body("description").optional().isString(),
    body("longitude").isFloat({ min: -180, max: 180 }).notEmpty(),
    body("latitude").isFloat({ min: -90, max: 90 }).notEmpty(),
  ];

  router.use(authMiddleware, ensureRole);

  router.post("/", createAssetParam, createAsset);

  router.get("/", async (req, res) => {
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
    if (!errors.isEmpty())
      return res
        .status(400)
        .json(createResponse(null, "bad request", 400, false, {}, errors));
    const {
      name,
      asset_type,
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
