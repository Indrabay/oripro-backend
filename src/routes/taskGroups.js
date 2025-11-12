const { Router } = require('express');
const { body, validationResult, param, query } = require('express-validator');
const { authMiddleware, ensureRole } = require('../middleware/auth');

function InitTaskGroupRouter(taskGroupUsecase) {
  const router = Router();
  router.use(authMiddleware, ensureRole);

  // GET /api/task-groups - List all task groups
  router.get(
    '/',
    [
      query('is_active').optional().isBoolean().withMessage('is_active must be a boolean')
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      
      req.log?.info({ query: req.query }, 'route_task_groups_list');
      try {
        const filter = {};
        if (req.query.is_active !== undefined) {
          filter.is_active = req.query.is_active === 'true';
        }
        
        const taskGroups = await taskGroupUsecase.listAllTaskGroups(filter, {
          requestId: req.requestId,
          log: req.log,
          userId: req.auth?.userId,
        });
        return res.json(taskGroups);
      } catch (error) {
        req.log?.error({ error: error.message, stack: error.stack }, 'route_task_groups_list_error');
        return res.status(500).json({
          message: 'Internal Server Error',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
    }
  );

  // GET /api/task-groups/:id - Get task group by ID
  router.get(
    '/:id',
    [param('id').isInt({ min: 1 }).withMessage('Invalid task group ID')],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      
      req.log?.info({ id: req.params.id }, 'route_task_groups_get');
      try {
        const taskGroup = await taskGroupUsecase.getTaskGroupById(req.params.id, {
          requestId: req.requestId,
          log: req.log,
          userId: req.auth?.userId,
        });
        if (!taskGroup) return res.status(404).json({ message: 'Task group not found' });
        return res.json(taskGroup);
      } catch (error) {
        req.log?.error({ error: error.message }, 'route_task_groups_get_error');
        return res.status(500).json({ message: 'Internal Server Error' });
      }
    }
  );

  // POST /api/task-groups - Create new task group
  router.post(
    '/',
    [
      body('name').isString().notEmpty().trim().withMessage('Name is required'),
      body('description').optional().isString().trim(),
      body('start_time')
        .isString()
        .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Start time must be in HH:mm format (e.g., 06:00)'),
      body('end_time')
        .isString()
        .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('End time must be in HH:mm format (e.g., 14:00)'),
      body('is_active').optional().isBoolean().withMessage('is_active must be a boolean'),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      
      req.log?.info({ name: req.body.name }, 'route_task_groups_create');
      try {
        const taskGroup = await taskGroupUsecase.createTaskGroup(req.body, {
          requestId: req.requestId,
          log: req.log,
          userId: req.auth?.userId,
        });
        return res.status(201).json(taskGroup);
      } catch (error) {
        req.log?.error({ error: error.message }, 'route_task_groups_create_error');
        return res.status(500).json({
          message: 'Internal Server Error',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
    }
  );

  // PUT /api/task-groups/:id - Update task group
  router.put(
    '/:id',
    [
      param('id').isInt({ min: 1 }).withMessage('Invalid task group ID'),
      body('name').optional().isString().notEmpty().trim(),
      body('description').optional().isString().trim(),
      body('start_time')
        .optional()
        .isString()
        .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Start time must be in HH:mm format (e.g., 06:00)'),
      body('end_time')
        .optional()
        .isString()
        .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('End time must be in HH:mm format (e.g., 14:00)'),
      body('is_active').optional().isBoolean().withMessage('is_active must be a boolean'),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      
      req.log?.info({ id: req.params.id }, 'route_task_groups_update');
      try {
        const updatedTaskGroup = await taskGroupUsecase.updateTaskGroup(
          req.params.id,
          req.body,
          {
            requestId: req.requestId,
            log: req.log,
            userId: req.auth?.userId,
          }
        );
        if (!updatedTaskGroup) return res.status(404).json({ message: 'Task group not found' });
        return res.json(updatedTaskGroup);
      } catch (error) {
        req.log?.error({ error: error.message }, 'route_task_groups_update_error');
        return res.status(500).json({
          message: 'Internal Server Error',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
    }
  );

  // DELETE /api/task-groups/:id - Delete task group
  router.delete(
    '/:id',
    [param('id').isInt({ min: 1 }).withMessage('Invalid task group ID')],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      
      req.log?.info({ id: req.params.id }, 'route_task_groups_delete');
      try {
        const deleted = await taskGroupUsecase.deleteTaskGroup(req.params.id, {
          requestId: req.requestId,
          log: req.log,
          userId: req.auth?.userId,
        });
        if (!deleted) return res.status(404).json({ message: 'Task group not found' });
        return res.status(204).send();
      } catch (error) {
        req.log?.error({ error: error.message }, 'route_task_groups_delete_error');
        return res.status(500).json({
          message: 'Internal Server Error',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
    }
  );

  // GET /api/task-groups/work/list - Get task groups with tasks and user tasks for work page
  router.get(
    '/work/list',
    async (req, res) => {
      req.log?.info({ userId: req.auth?.userId }, 'route_task_groups_work_list');
      try {
        if (!req.auth?.userId) {
          return res.status(401).json({
            message: 'Unauthorized',
            error: 'User ID not found in authentication'
          });
        }
        
        const taskGroups = await taskGroupUsecase.getTaskGroupsWithUserTasks(req.auth?.userId, {
          requestId: req.requestId,
          log: req.log,
          userId: req.auth?.userId,
        });
        
        req.log?.info({ 
          userId: req.auth?.userId,
          taskGroupsCount: taskGroups.length 
        }, 'route_task_groups_work_list_success');
        
        return res.json(taskGroups);
      } catch (error) {
        req.log?.error({ error: error.message, stack: error.stack }, 'route_task_groups_work_list_error');
        return res.status(500).json({
          message: 'Internal Server Error',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
    }
  );

  return router;
}

module.exports = { InitTaskGroupRouter };

