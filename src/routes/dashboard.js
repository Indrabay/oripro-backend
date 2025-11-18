const { Router } = require('express');
const { authMiddleware, ensureRole } = require('../middleware/auth');
const { createResponse } = require('../services/response');

function InitDashboardRouter(dashboardUsecase) {
  const router = Router();

  router.use(authMiddleware, ensureRole);

  router.get('/', async (req, res) => {
    try {
      req.log?.info({}, 'DashboardRouter.getDashboardData');
      const dashboardData = await dashboardUsecase.getDashboardData({
        userId: req.auth?.userId,
        log: req.log,
      });

      return res.status(200).json(
        createResponse(dashboardData, 'Dashboard data retrieved successfully', 200)
      );
    } catch (error) {
      req.log?.error(
        { error: error.message, stack: error.stack },
        'DashboardRouter.getDashboardData_error'
      );
      return res.status(500).json(
        createResponse(null, 'Internal server error', 500)
      );
    }
  });

  router.get('/stats', async (req, res) => {
    try {
      req.log?.info({}, 'DashboardRouter.getDashboardStats');
      const stats = await dashboardUsecase.getDashboardStats({
        userId: req.auth?.userId,
        log: req.log,
      });

      return res.status(200).json(
        createResponse(stats, 'Dashboard stats retrieved successfully', 200)
      );
    } catch (error) {
      req.log?.error(
        { error: error.message, stack: error.stack },
        'DashboardRouter.getDashboardStats_error'
      );
      return res.status(500).json(
        createResponse(null, 'Internal server error', 500)
      );
    }
  });

  return router;
}

module.exports = { InitDashboardRouter };

