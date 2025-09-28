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
      
      // Return mock data for development/testing
      if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV !== 'production') {
        req.log?.info({}, 'returning_mock_menus_data');
        return res.json([
          {
            id: '1',
            title: 'Dashboard',
            url: '/dashboard',
            icon: 'House',
            parent_id: null,
            order: 1,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '2',
            title: 'Users',
            url: '#',
            icon: 'UsersRound',
            parent_id: null,
            order: 2,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '3',
            title: 'Manage Users',
            url: '/users',
            icon: 'UsersRound',
            parent_id: '2',
            order: 1,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '4',
            title: 'Manage Roles',
            url: '/roles',
            icon: 'ShieldCheck',
            parent_id: '2',
            order: 2,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '5',
            title: 'Asset',
            url: '/asset',
            icon: 'Boxes',
            parent_id: null,
            order: 3,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '6',
            title: 'Unit',
            url: '/unit',
            icon: 'Building2',
            parent_id: null,
            order: 4,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '7',
            title: 'Tenants',
            url: '/tenants',
            icon: 'Building2',
            parent_id: null,
            order: 5,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '8',
            title: 'Menu Management',
            url: '/menus',
            icon: 'Menu',
            parent_id: null,
            order: 6,
            is_active: true,
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

  // GET /api/menus/:id - Get menu by ID
  router.get(
    '/:id',
    [param('id').isString().notEmpty()],
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
      body('parent_id').optional().custom((value) => {
        if (value === null || value === undefined || value === '') return true;
        return typeof value === 'string' && value.length > 0;
      }),
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
      param('id').isString().notEmpty(),
      body('title').optional().isString().notEmpty(),
      body('url').optional().isString(),
      body('icon').optional().isString(),
      body('parent_id').optional().custom((value) => {
        if (value === null || value === undefined || value === '') return true;
        return typeof value === 'string' && value.length > 0;
      }),
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
    [param('id').isString().notEmpty()],
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
