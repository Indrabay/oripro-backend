const { Router } = require('express');
const { body, validationResult, param } = require('express-validator');
const { authMiddleware, ensureRole } = require('../middleware/auth');

function InitMenuRouter(menuUsecase) {
  const router = Router();
  router.use(authMiddleware, ensureRole);

  // GET /api/menus - List all menus
  router.get('/', async (req, res) => {
    req.log?.info({}, 'route_menus_list');
    try {
      const menus = await menuUsecase.listAllMenus({ requestId: req.requestId, log: req.log });
      return res.json(menus);
    } catch (error) {
      req.log?.error({ error: error.message, stack: error.stack }, 'route_menus_list_error');
      
      return res.status(500).json({ 
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // GET /api/menus/:id - Get menu by ID
  router.get(
    '/:id',
    [param('id').isInt({ min: 1 }).withMessage('Invalid menu ID')],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      req.log?.info({ id: req.params.id }, 'route_menus_get');
      try {
        const menu = await menuUsecase.getMenu(req.params.id, { requestId: req.requestId, log: req.log });
        if (!menu) return res.status(404).json({ message: 'Menu not found' });
        return res.json(menu);
      } catch (error) {
        req.log?.error({ error: error.message }, 'route_menus_get_error');
        return res.status(500).json({ message: 'Internal Server Error' });
      }
    }
  );

  // POST /api/menus - Create new menu
  router.post(
    '/',
    [
      body('title').isString().notEmpty(),
      body('url').optional().isString(),
      body('icon').optional().isString(),
      body('parent_id').optional().isInt({ min: 1 }).withMessage('Parent ID must be a positive integer'),
      body('order').optional().isInt(),
      body('is_active').optional().isBoolean(),
      body('can_view').optional().isBoolean(),
      body('can_add').optional().isBoolean(),
      body('can_edit').optional().isBoolean(),
      body('can_delete').optional().isBoolean(),
      body('can_confirm').optional().isBoolean()
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      req.log?.info({ title: req.body.title }, 'route_menus_create');
      try {
        const menu = await menuUsecase.createMenu(req.body, { requestId: req.requestId, log: req.log, userId: req.auth.userId });
        return res.status(201).json(menu);
      } catch (error) {
        req.log?.error({ error: error.message }, 'route_menus_create_error');
        return res.status(500).json({ message: 'Internal Server Error' });
      }
    }
  );

  // PUT /api/menus/:id - Update menu
  router.put(
    '/:id',
    [
      param('id').isInt({ min: 1 }).withMessage('Invalid menu ID'),
      body('title').optional().isString().notEmpty(),
      body('url').optional().isString(),
      body('icon').optional().isString(),
      body('parent_id').optional().isInt({ min: 1 }).withMessage('Parent ID must be a positive integer'),
      body('order').optional().isInt(),
      body('is_active').optional().isBoolean(),
      body('can_view').optional().isBoolean(),
      body('can_add').optional().isBoolean(),
      body('can_edit').optional().isBoolean(),
      body('can_delete').optional().isBoolean(),
      body('can_confirm').optional().isBoolean()
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      req.log?.info({ id: req.params.id }, 'route_menus_update');
      try {
        const updatedMenu = await menuUsecase.updateMenu(req.params.id, req.body, { requestId: req.requestId, log: req.log, userId: req.auth.userId });
        if (!updatedMenu) return res.status(404).json({ message: 'Menu not found' });
        return res.json(updatedMenu);
      } catch (error) {
        req.log?.error({ error: error.message }, 'route_menus_update_error');
        return res.status(500).json({ message: 'Internal Server Error' });
      }
    }
  );

  // DELETE /api/menus/:id - Delete menu
  router.delete(
    '/:id',
    [param('id').isInt({ min: 1 }).withMessage('Invalid menu ID')],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      req.log?.info({ id: req.params.id }, 'route_menus_delete');
      try {
        const deleted = await menuUsecase.deleteMenu(req.params.id, { requestId: req.requestId, log: req.log, userId: req.auth.userId });
        if (!deleted) return res.status(404).json({ message: 'Menu not found' });
        return res.status(204).send();
      } catch (error) {
        req.log?.error({ error: error.message }, 'route_menus_delete_error');
        return res.status(500).json({ message: 'Internal Server Error' });
      }
    }
  );

  return router;
}

module.exports = { InitMenuRouter };
