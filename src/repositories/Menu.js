class MenuRepository {
  constructor(menuModel) {
    this.menuModel = menuModel;
  }

  async findAll(ctx = {}) {
    ctx.log?.info({}, 'repo_find_all_menus');
    const menus = await this.menuModel.findAll({
      order: [['order', 'ASC'], ['created_at', 'ASC']]
    });
    return menus.map(menu => menu.toJSON());
  }

  async findById(id, ctx = {}) {
    ctx.log?.debug({ id }, 'repo_find_menu_by_id');
    const menu = await this.menuModel.findByPk(id, {
      include: [
        {
          model: this.menuModel,
          as: 'children',
          required: false,
          order: [['order', 'ASC']],
        },
        {
          model: this.menuModel,
          as: 'parent',
          required: false,
        }
      ]
    });
    return menu ? menu.toJSON() : null;
  }

  async create(menuData, ctx = {}) {
    ctx.log?.info({ title: menuData.title }, 'repo_create_menu');
    const menu = await this.menuModel.create({
      title: menuData.title,
      url: menuData.url,
      icon: menuData.icon,
      parent_id: menuData.parent_id,
      order: menuData.order || 0,
      is_active: menuData.is_active !== undefined ? menuData.is_active : true,
      can_view: menuData.can_view !== undefined ? menuData.can_view : true,
      can_add: menuData.can_add !== undefined ? menuData.can_add : false,
      can_edit: menuData.can_edit !== undefined ? menuData.can_edit : false,
      can_delete: menuData.can_delete !== undefined ? menuData.can_delete : false,
      can_confirm: menuData.can_confirm !== undefined ? menuData.can_confirm : false,
      created_by: menuData.created_by,
      updated_by: menuData.updated_by
    });
    return menu.toJSON();
  }

  async update(id, menuData, ctx = {}) {
    ctx.log?.info({ id }, 'repo_update_menu');
    const menu = await this.menuModel.findByPk(id);
    if (!menu) return null;

    await menu.update({
      title: menuData.title ?? menu.title,
      url: menuData.url ?? menu.url,
      icon: menuData.icon ?? menu.icon,
      parent_id: menuData.parent_id !== undefined ? menuData.parent_id : menu.parent_id,
      order: menuData.order ?? menu.order,
      is_active: menuData.is_active !== undefined ? menuData.is_active : menu.is_active,
      can_view: menuData.can_view !== undefined ? menuData.can_view : menu.can_view,
      can_add: menuData.can_add !== undefined ? menuData.can_add : menu.can_add,
      can_edit: menuData.can_edit !== undefined ? menuData.can_edit : menu.can_edit,
      can_delete: menuData.can_delete !== undefined ? menuData.can_delete : menu.can_delete,
      can_confirm: menuData.can_confirm !== undefined ? menuData.can_confirm : menu.can_confirm,
      updated_by: menuData.updated_by ?? menu.updated_by,
      updated_at: new Date()
    });

    return menu.toJSON();
  }

  async delete(id, ctx = {}) {
    ctx.log?.info({ id }, 'repo_delete_menu');
    const deleted = await this.menuModel.destroy({ 
      where: { id },
      cascade: true // This will also delete children if needed
    });
    return deleted > 0;
  }

  async findByParentId(parentId, ctx = {}) {
    ctx.log?.debug({ parentId }, 'repo_find_menus_by_parent_id');
    const menus = await this.menuModel.findAll({
      where: { parent_id: parentId },
      order: [['order', 'ASC'], ['created_at', 'ASC']]
    });
    return menus.map(menu => menu.toJSON());
  }

  async findActiveMenus(ctx = {}) {
    ctx.log?.info({}, 'repo_find_active_menus');
    const menus = await this.menuModel.findAll({
      where: { is_active: true },
      order: [['order', 'ASC'], ['created_at', 'ASC']],
      include: [
        {
          model: this.menuModel,
          as: 'children',
          required: false,
          where: { is_active: true },
          order: [['order', 'ASC']],
        }
      ]
    });
    return menus.map(menu => menu.toJSON());
  }

  async getMenuHierarchy(ctx = {}) {
    ctx.log?.info({}, 'repo_get_menu_hierarchy');
    const parentMenus = await this.menuModel.findAll({
      where: { 
        parent_id: null,
        is_active: true 
      },
      order: [['order', 'ASC'], ['created_at', 'ASC']],
      include: [
        {
          model: this.menuModel,
          as: 'children',
          required: false,
          where: { is_active: true },
          order: [['order', 'ASC']],
        }
      ]
    });
    return parentMenus.map(menu => menu.toJSON());
  }
}

module.exports = MenuRepository;
