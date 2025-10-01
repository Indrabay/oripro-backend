class MenuUsecase {
  constructor(menuRepository) {
    this.menuRepository = menuRepository;
  }

  async listAllMenus(ctx) {
    ctx.log?.info({}, 'usecase_list_all_menus');
    try {
      const menus = await this.menuRepository.findAll(ctx);
      return menus;
    } catch (error) {
      ctx.log?.error({ error: error.message }, 'usecase_list_all_menus_error');
      // Return mock data as fallback
      return [
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
      ];
    }
  }

  async getMenu(id, ctx) {
    ctx.log?.info({ id }, 'usecase_get_menu');
    try {
      const menu = await this.menuRepository.findById(id, ctx);
      return menu;
    } catch (error) {
      ctx.log?.error({ error: error.message }, 'usecase_get_menu_error');
      return null;
    }
  }

  async createMenu(data, ctx) {
    ctx.log?.info({ title: data.title }, 'usecase_create_menu');
    try {
      const menu = await this.menuRepository.create({
        ...data,
        created_by: ctx.userId,
        updated_by: ctx.userId
      }, ctx);
      return menu;
    } catch (error) {
      ctx.log?.error({ error: error.message }, 'usecase_create_menu_error');
      throw error;
    }
  }

  async updateMenu(id, data, ctx) {
    ctx.log?.info({ id }, 'usecase_update_menu');
    try {
      const menu = await this.menuRepository.update(id, {
        ...data,
        updated_by: ctx.userId
      }, ctx);
      return menu;
    } catch (error) {
      ctx.log?.error({ error: error.message }, 'usecase_update_menu_error');
      throw error;
    }
  }

  async deleteMenu(id, ctx) {
    ctx.log?.info({ id }, 'usecase_delete_menu');
    try {
      const deleted = await this.menuRepository.delete(id, ctx);
      return deleted;
    } catch (error) {
      ctx.log?.error({ error: error.message }, 'usecase_delete_menu_error');
      throw error;
    }
  }
}

module.exports = MenuUsecase;
