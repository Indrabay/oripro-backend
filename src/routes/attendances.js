const { Router } = require('express');
const { body, validationResult } = require('express-validator');
const { authMiddleware, ensureRole } = require('../middleware/auth');

function InitAttendanceRouter(attendanceUsecase) {
  const router = Router();
  router.use(authMiddleware, ensureRole);

  // Check-in endpoint
  router.post('/check-in', [
    body('asset_id').notEmpty().withMessage('Asset ID is required'),
    body('latitude').isFloat().withMessage('Latitude must be a valid number'),
    body('longitude').isFloat().withMessage('Longitude must be a valid number'),
    body('notes').optional().isString().withMessage('Notes must be a string')
  ], async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errors.array()
        });
      }

      const { asset_id, latitude, longitude, notes } = req.body;
      const user_id = req.user.id;

      req.log?.info({ user_id, asset_id, latitude, longitude, notes }, 'route_check_in');
      const result = await attendanceUsecase.checkIn(user_id, asset_id, latitude, longitude, notes);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      req.log?.error({ error: error.message, stack: error.stack }, 'route_check_in_error');
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  });

  // Check-out endpoint
  router.post('/check-out', [
    body('asset_id').notEmpty().withMessage('Asset ID is required'),
    body('latitude').isFloat().withMessage('Latitude must be a valid number'),
    body('longitude').isFloat().withMessage('Longitude must be a valid number'),
    body('notes').optional().isString().withMessage('Notes must be a string')
  ], async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errors.array()
        });
      }

      const { asset_id, latitude, longitude, notes } = req.body;
      const user_id = req.user.id;

      req.log?.info({ user_id, asset_id, latitude, longitude, notes }, 'route_check_out');
      const result = await attendanceUsecase.checkOut(user_id, asset_id, latitude, longitude, notes);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      req.log?.error({ error: error.message, stack: error.stack }, 'route_check_out_error');
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  });

  // Get today's attendance status
  router.get('/today-status/:assetId', async (req, res) => {
    try {
      const { assetId } = req.params;
      const user_id = req.user.id;

      req.log?.info({ user_id, assetId }, 'route_get_today_status');
      const result = await attendanceUsecase.getTodayStatus(user_id, assetId);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      req.log?.error({ error: error.message, stack: error.stack }, 'route_get_today_status_error');
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  });

  // Get user attendance history
  router.get('/history', async (req, res) => {
    try {
      const user_id = req.user.id;
      const limit = parseInt(req.query.limit) || 10;

      req.log?.info({ user_id, limit }, 'route_get_user_history');
      const result = await attendanceUsecase.getUserAttendanceHistory(user_id, limit);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      req.log?.error({ error: error.message, stack: error.stack }, 'route_get_user_history_error');
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  });

  // Get asset attendance history (admin only)
  router.get('/asset-history/:assetId', async (req, res) => {
    try {
      const { assetId } = req.params;
      const limit = parseInt(req.query.limit) || 10;

      req.log?.info({ assetId, limit }, 'route_get_asset_history');
      const result = await attendanceUsecase.getAssetAttendanceHistory(assetId, limit);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      req.log?.error({ error: error.message, stack: error.stack }, 'route_get_asset_history_error');
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  });

  return router;
}

module.exports = { InitAttendanceRouter };
