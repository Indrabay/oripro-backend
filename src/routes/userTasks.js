const { Router } = require("express");
const { body, validationResult, param, query } = require("express-validator");
const { authMiddleware, ensureRole } = require("../middleware/auth");
const { createResponse } = require("../services/response");

function InitUserTaskRouter(userTaskUsecase) {
  const router = Router();

  async function generateUpcomingUserTasks(req, res) {
    try {
      req.log?.info({}, "UserTaskRouter.generateUpcomingUserTasks");
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json(createResponse(null, "validation error", 400, errors.array()));
      }
      
      const result = await userTaskUsecase.generateUpcomingUserTasks({
        userId: req.auth?.userId,
        log: req.log,
      });
      
      return res.status(201).json(createResponse(result, "User tasks generated successfully", 201));
    } catch (error) {
      req.log?.error(error, "UserTaskRouter.generateUpcomingUserTasks");
      return res
        .status(500)
        .json(createResponse(null, "internal server error", 500));
    }
  }

  async function getUserTasks(req, res) {
    try {
      req.log?.info({}, "UserTaskRouter.getUserTasks");
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json(createResponse(null, "validation error", 400, errors.array()));
      }
      
      const result = await userTaskUsecase.getUserTasks(req.auth?.userId, req.query, {
        userId: req.auth?.userId,
        log: req.log,
      });
      
      return res.status(200).json(createResponse(result, "success", 200));
    } catch (error) {
      req.log?.error(error, "UserTaskRouter.getUserTasks");
      return res
        .status(500)
        .json(createResponse(null, "internal server error", 500));
    }
  }

  async function getUpcomingUserTasks(req, res) {
    try {
      req.log?.info({}, "UserTaskRouter.getUpcomingUserTasks");
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json(createResponse(null, "validation error", 400, errors.array()));
      }
      
      const result = await userTaskUsecase.getUpcomingUserTasks(req.auth?.userId, {
        userId: req.auth?.userId,
        log: req.log,
      });
      
      return res.status(200).json(createResponse(result, "success", 200));
    } catch (error) {
      req.log?.error(error, "UserTaskRouter.getUpcomingUserTasks");
      return res
        .status(500)
        .json(createResponse(null, "internal server error", 500));
    }
  }

  async function startUserTask(req, res) {
    try {
      req.log?.info({ id: req.params.id }, "UserTaskRouter.startUserTask");
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json(createResponse(null, "validation error", 400, errors.array()));
      }
      
      const result = await userTaskUsecase.startUserTask(req.params.id, {
        userId: req.auth?.userId,
        log: req.log,
      });
      
      if (!result) {
        return res
          .status(404)
          .json(createResponse(null, "user task not found", 404));
      }
      
      return res.status(200).json(createResponse(result, "Task started successfully", 200));
    } catch (error) {
      req.log?.error(error, "UserTaskRouter.startUserTask");
      return res
        .status(500)
        .json(createResponse(null, "internal server error", 500));
    }
  }

  async function completeUserTask(req, res) {
    try {
      req.log?.info({ id: req.params.id }, "UserTaskRouter.completeUserTask");
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json(createResponse(null, "validation error", 400, errors.array()));
      }
      
      const result = await userTaskUsecase.completeUserTask(req.params.id, req.body, {
        userId: req.auth?.userId,
        log: req.log,
      });
      
      if (!result) {
        return res
          .status(404)
          .json(createResponse(null, "user task not found", 404));
      }
      
      return res.status(200).json(createResponse(result, "Task completed successfully", 200));
    } catch (error) {
      req.log?.error(error, "UserTaskRouter.completeUserTask");
      return res
        .status(500)
        .json(createResponse(null, "internal server error", 500));
    }
  }

  async function getCompletedTasks(req, res) {
    try {
      req.log?.info({ query: req.query }, "UserTaskRouter.getCompletedTasks");
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json(createResponse(null, "validation error", 400, errors.array()));
      }
      
      // Get user_id from query or use authenticated user's ID
      const userId = req.query.user_id || req.auth?.userId;
      
      const result = await userTaskUsecase.getCompletedTasks(userId, req.query, {
        userId: req.auth?.userId,
        log: req.log,
      });
      
      return res.status(200).json(createResponse(result, "success", 200));
    } catch (error) {
      req.log?.error(error, "UserTaskRouter.getCompletedTasks");
      
      // Handle validation errors with specific messages
      if (error.message.includes('Invalid') || error.message.includes('must be')) {
        return res
          .status(400)
          .json(createResponse(null, error.message, 400));
      }
      
      return res
        .status(500)
        .json(createResponse(null, "internal server error", 500));
    }
  }

  const getUserTasksParam = [
    query("limit").isInt().optional(),
    query("offset").isInt().optional(),
  ];

  const startUserTaskParam = [
    param("id").isInt().notEmpty(),
  ];

  const completeUserTaskParam = [
    param("id").isInt().notEmpty(),
    body("notes").isString().optional(),
  ];

  const getCompletedTasksParam = [
    query("start_date").optional().matches(/^\d{4}-\d{2}-\d{2}$/).withMessage("start_date must be in YYYY-MM-DD format"),
    query("end_date").optional().matches(/^\d{4}-\d{2}-\d{2}$/).withMessage("end_date must be in YYYY-MM-DD format"),
    query("user_id").optional().isUUID().withMessage("user_id must be a valid UUID"),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit must be between 1 and 100"),
    query("offset").optional().isInt({ min: 0 }).withMessage("offset must be a non-negative integer"),
  ];

  router.use(authMiddleware, ensureRole);

  router.post("/generate-upcoming", generateUpcomingUserTasks);
  router.get("/", getUserTasksParam, getUserTasks);
  router.get("/upcoming", getUpcomingUserTasks);
  router.get("/completed", getCompletedTasksParam, getCompletedTasks);
  router.put("/:id/start", startUserTaskParam, startUserTask);
  router.put("/:id/complete", completeUserTaskParam, completeUserTask);

  return router;
}

module.exports = { InitUserTaskRouter };
