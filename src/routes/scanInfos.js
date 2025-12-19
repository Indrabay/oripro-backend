const { Router } = require("express");
const { body, validationResult, param, query } = require("express-validator");
const { authMiddleware, ensureRole } = require("../middleware/auth");
const { createResponse } = require("../services/response");

function InitScanInfoRouter(scanInfoUsecase) {
  const router = Router();

  async function createScanInfo(req, res) {
    try {
      req.log?.info({}, "ScanInfoRouter.createScanInfo");
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json(createResponse(null, "validation error", 400, errors.array()));
      }
      const scanInfo = await scanInfoUsecase.createScanInfo(req.body, {
        userId: req.auth?.userId,
        log: req.log,
      });
      return res.status(201).json(createResponse(scanInfo, "success", 201));
    } catch (error) {
      req.log?.error(error, "ScanInfoRouter.createScanInfo");
      return res
        .status(500)
        .json(createResponse(null, "internal server error", 500));
    }
  }

  async function getScanInfo(req, res) {
    try {
      req.log?.info({ id: req.params.id }, "ScanInfoRouter.getScanInfo");
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json(createResponse(null, "validation error", 400, errors.array()));
      }
      const scanInfo = await scanInfoUsecase.getScanInfo(req.params.id, {
        userId: req.auth?.userId,
        log: req.log,
      });
      if (!scanInfo) {
        return res
          .status(404)
          .json(createResponse(null, "scan info not found", 404));
      }
      return res.status(200).json(createResponse(scanInfo, "success", 200));
    } catch (error) {
      req.log?.error(error, "ScanInfoRouter.getScanInfo");
      return res
        .status(500)
        .json(createResponse(null, "internal server error", 500));
    }
  }

  async function getScanInfosByScanCode(req, res) {
    try {
      req.log?.info({ scanCode: req.params.scanCode }, "ScanInfoRouter.getScanInfosByScanCode");
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json(createResponse(null, "validation error", 400, errors.array()));
      }
      const scanInfos = await scanInfoUsecase.getScanInfosByScanCode(req.params.scanCode, {
        userId: req.auth?.userId,
        log: req.log,
      });
      return res.status(200).json(createResponse(scanInfos, "success", 200));
    } catch (error) {
      req.log?.error(error, "ScanInfoRouter.getScanInfosByScanCode");
      return res
        .status(500)
        .json(createResponse(null, "internal server error", 500));
    }
  }

  async function listScanInfos(req, res) {
    try {
      req.log?.info({}, "ScanInfoRouter.listScanInfos");
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json(createResponse(null, "validation error", 400, errors.array()));
      }
      const result = await scanInfoUsecase.listScanInfos(req.query, {
        userId: req.auth?.userId,
        log: req.log,
      });
      // Extract pagination from result and pass to createResponse
      const pagination = result.total !== undefined ? {
        total: result.total,
        limit: result.limit || req.query.limit || 10,
        offset: result.offset || req.query.offset || 0
      } : {};
      return res.status(200).json(createResponse(result, "success", 200, true, pagination));
    } catch (error) {
      req.log?.error(error, "ScanInfoRouter.listScanInfos");
      return res
        .status(500)
        .json(createResponse(null, "internal server error", 500));
    }
  }

  async function updateScanInfo(req, res) {
    try {
      req.log?.info({ id: req.params.id }, "ScanInfoRouter.updateScanInfo");
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json(createResponse(null, "validation error", 400, errors.array()));
      }
      const scanInfo = await scanInfoUsecase.updateScanInfo(req.params.id, req.body, {
        userId: req.auth?.userId,
        log: req.log,
      });
      if (!scanInfo) {
        return res
          .status(404)
          .json(createResponse(null, "scan info not found", 404));
      }
      return res.status(200).json(createResponse(scanInfo, "success", 200));
    } catch (error) {
      req.log?.error(error, "ScanInfoRouter.updateScanInfo");
      return res
        .status(500)
        .json(createResponse(null, "internal server error", 500));
    }
  }

  async function deleteScanInfo(req, res) {
    try {
      req.log?.info({ id: req.params.id }, "ScanInfoRouter.deleteScanInfo");
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json(createResponse(null, "validation error", 400, errors.array()));
      }
      const result = await scanInfoUsecase.deleteScanInfo(req.params.id, {
        userId: req.auth?.userId,
        log: req.log,
      });
      if (!result) {
        return res
          .status(404)
          .json(createResponse(null, "scan info not found", 404));
      }
      return res.status(200).json(createResponse(null, "deleted successfully", 200));
    } catch (error) {
      req.log?.error(error, "ScanInfoRouter.deleteScanInfo");
      return res
        .status(500)
        .json(createResponse(null, "internal server error", 500));
    }
  }

  async function generateQRCode(req, res) {
    try {
      req.log?.info({ id: req.params.id }, "ScanInfoRouter.generateQRCode");
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json(createResponse(null, "validation error", 400, errors.array()));
      }

      // Disable caching to prevent 304 responses
      res.set({
        'Cache-Control': 'no-store, no-cache, must-revalidate, private',
        'Pragma': 'no-cache',
        'Expires': '0'
      });

      const result = await scanInfoUsecase.generateQRCode(req.params.id, {
        userId: req.auth?.userId,
        log: req.log,
      });

      if (!result) {
        return res
          .status(404)
          .json(createResponse(null, "scan info not found", 404));
      }

      return res.status(200).json(createResponse(result, "success", 200));
    } catch (error) {
      req.log?.error({ error: error.message, errorStack: error.stack, id: req.params.id }, "ScanInfoRouter.generateQRCode");
      return res
        .status(500)
        .json(createResponse(null, "internal server error", 500));
    }
  }

  const createScanInfoParam = [
    body("scan_code").isString().notEmpty().trim(),
    body("latitude").isFloat().optional(),
    body("longitude").isFloat().optional(),
    body("asset_id").isUUID().optional(),
  ];

  const getScanInfoParam = [
    param("id").isInt().notEmpty(),
  ];

  const getScanInfosByScanCodeParam = [
    param("scanCode").isString().notEmpty(),
  ];

  const listScanInfosParam = [
    query("limit").isInt().optional(),
    query("offset").isInt().optional(),
    query("asset_id").isUUID().optional(),
    query("scan_code").isString().optional(),
    query("user_id").isUUID().optional().withMessage("user_id must be a valid UUID"),
    query("created_by").isUUID().optional().withMessage("created_by must be a valid UUID"),
    query("start_date").optional().matches(/^\d{4}-\d{2}-\d{2}$/).withMessage("start_date must be in YYYY-MM-DD format"),
    query("end_date").optional().matches(/^\d{4}-\d{2}-\d{2}$/).withMessage("end_date must be in YYYY-MM-DD format"),
    query("order").isIn(['newest', 'oldest', 'a-z', 'z-a', 'asset-a-z', 'asset-z-a', 'user-a-z', 'user-z-a']).optional(),
  ];

  const updateScanInfoParam = [
    param("id").isInt().notEmpty(),
    body("scan_code").isString().optional().trim(),
    body("latitude").isFloat().optional(),
    body("longitude").isFloat().optional(),
    body("asset_id").isUUID().optional(),
  ];

  const deleteScanInfoParam = [
    param("id").isInt().notEmpty(),
  ];

  const generateQRCodeParam = [
    param("id").isInt().notEmpty(),
  ];

  router.use(authMiddleware, ensureRole);

  router.post("/", createScanInfoParam, createScanInfo);
  router.get("/", listScanInfosParam, listScanInfos);
  router.get("/:id/qr-code", generateQRCodeParam, generateQRCode); // More specific route first
  router.get("/:id", getScanInfoParam, getScanInfo);
  router.get("/scan-code/:scanCode", getScanInfosByScanCodeParam, getScanInfosByScanCode);
  router.put("/:id", updateScanInfoParam, updateScanInfo);
  router.delete("/:id", deleteScanInfoParam, deleteScanInfo);

  return router;
}

module.exports = { InitScanInfoRouter };

