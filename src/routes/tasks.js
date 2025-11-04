const { Router } = require("express");
const { body, validationResult, param } = require("express-validator");
const { authMiddleware, ensureRole } = require("../middleware/auth");
const { createResponse } = require("../services/response");

function InitTaskRouter(taskUsecase) {
  const router = Router();

  async function createTask(req, res) {
    try {
      req.log?.info({}, "TaskRouter.createTask");
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json(createResponse(null, "validation error", 400, errors.array()));
      }
      const task = await taskUsecase.createTask(req.body, {
        userId: req.auth?.userId,
        log: req.log,
      });
      return res.status(201).json(createResponse(task, "success", 201));
    } catch (error) {
      req.log?.error(error, "TaskRouter.createTask");
      return res
        .status(500)
        .json(createResponse(null, "internal server error", 500));
    }
  }

  async function getTasks(req, res) {
    try {
      req.log?.info({}, "TaskRouter.getTasks");
      // For now, return empty array - you can implement this later
      const tasks = [];
      return res.status(200).json(createResponse(tasks, "success", 200));
    } catch (error) {
      req.log?.error(error, "TaskRouter.getTasks");
      return res
        .status(500)
        .json(createResponse(null, "internal server error", 500));
    }
  }

  async function updateTask(req, res) {
    try {
      req.log?.info({ id: req.params.id }, "TaskRouter.updateTask");
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json(createResponse(null, "validation error", 400, errors.array()));
      }
      const task = await taskUsecase.updateTask(req.params.id, req.body, {
        userId: req.auth?.userId,
        log: req.log,
      });
      if (!task) {
        return res
          .status(404)
          .json(createResponse(null, "task not found", 404));
      }
      return res.status(200).json(createResponse(task, "success", 200));
    } catch (error) {
      req.log?.error(error, "TaskRouter.updateTask");
      return res
        .status(500)
        .json(createResponse(null, "internal server error", 500));
    }
  }

  async function getTaskLogs(req, res) {
    try {
      req.log?.info({ id: req.params.id }, "TaskRouter.getTaskLogs");
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json(createResponse(null, "validation error", 400, errors.array()));
      }
      const logs = await taskUsecase.getTaskLogs(req.params.id, {
        userId: req.auth?.userId,
        log: req.log,
      });
      return res.status(200).json(createResponse(logs, "success", 200));
    } catch (error) {
      req.log?.error(error, "TaskRouter.getTaskLogs");
      return res
        .status(500)
        .json(createResponse(null, "internal server error", 500));
    }
  }

  const createTaskParam = [
    body("name").isString().notEmpty().trim(),
    body("is_main_task").isBoolean().optional(),
    body("is_need_validation").isBoolean().optional(),
    body("is_scan").isBoolean().optional(),
    body("scan_code").isString().optional(),
    body("duration").isInt().notEmpty(),
    body("asset_id").isUUID().notEmpty(),
    body("role_id").isInt().notEmpty(),
    body("is_all_times").isBoolean().optional(),
    body("parent_task_ids").isArray().optional(),
    body("parent_task_ids.*").isInt().optional(),
    body("task_group_id").isInt().optional(),
    body("days").isArray().optional(),
    body("times").isArray().optional(),
  ];

  const updateTaskParam = [
    param("id").isInt().notEmpty(),
    body("name").isString().optional().trim(),
    body("is_main_task").isBoolean().optional(),
    body("is_need_validation").isBoolean().optional(),
    body("is_scan").isBoolean().optional(),
    body("scan_code").isString().optional(),
    body("duration").isInt().optional(),
    body("asset_id").isUUID().optional(),
    body("role_id").isInt().optional(),
    body("is_all_times").isBoolean().optional(),
    body("parent_task_ids").isArray().optional(), // Array of parent task IDs
    body("parent_task_ids.*").isInt().optional(), // Validate each element in array
    body("task_group_id").isInt().optional(),
  ];

  const getTaskLogsParam = [
    param("id").isInt().notEmpty(),
  ];

  router.use(authMiddleware, ensureRole);

  router.post("/", createTaskParam, createTask);
  router.get("/", getTasks);
  router.put("/:id", updateTaskParam, updateTask);
  router.get("/:id/logs", getTaskLogsParam, getTaskLogs);

  return router;
}

module.exports = { InitTaskRouter };
