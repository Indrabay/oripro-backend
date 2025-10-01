class UserAccessMenuRepository {
  constructor(userModel, roleModel, roleMenuPermissionModel, menuModel) {
    this.userModel = userModel;
    this.roleModel = roleModel;
    this.roleMenuPermissionModel = roleMenuPermissionModel;
    this.menuModel = menuModel;
  }

  async getUserAccessibleMenus(userId, ctx = {}) {
    ctx.log?.info({ userId }, 'repo_get_user_accessible_menus');
    
    try {
      // Get user with role and menu permissions
      const user = await this.userModel.findByPk(userId, {
        include: [{
          model: this.roleModel,
          as: 'role',
          include: [{
            model: this.roleMenuPermissionModel,
            as: 'menuPermissions',
            where: { can_view: true },
            include: [{
              model: this.menuModel,
              as: 'menu',
              where: { is_active: true },
              attributes: ['id', 'title', 'url', 'icon', 'parent_id', 'order', 'is_active'],
              order: [['order', 'ASC']]
            }]
          }]
        }]
      });

      if (!user || !user.role) {
        ctx.log?.warn({ userId }, 'user_or_role_not_found');
        return [];
      }

      // Extract accessible menus from role
      const accessibleMenus = user.role.menuPermissions?.map(perm => ({
        id: perm.menu.id,
        title: perm.menu.title,
        url: perm.menu.url,
        icon: perm.menu.icon,
        parent_id: perm.menu.parent_id,
        order: perm.menu.order,
        is_active: perm.menu.is_active,
        can_view: perm.can_view,
        can_create: perm.can_create,
        can_update: perm.can_update,
        can_delete: perm.can_delete,
        can_confirm: perm.can_confirm
      })) || [];

      // Build hierarchical menu structure
      const menuMap = new Map();
      const rootMenus = [];

      // First pass: create menu objects
      accessibleMenus.forEach(menu => {
        menuMap.set(menu.id, { ...menu, children: [] });
      });

      // Second pass: build hierarchy
      accessibleMenus.forEach(menu => {
        if (menu.parent_id && menuMap.has(menu.parent_id)) {
          menuMap.get(menu.parent_id).children.push(menuMap.get(menu.id));
        } else {
          rootMenus.push(menuMap.get(menu.id));
        }
      });

      // Sort menus by order
      const sortMenus = (menus) => {
        menus.sort((a, b) => a.order - b.order);
        menus.forEach(menu => {
          if (menu.children.length > 0) {
            sortMenus(menu.children);
          }
        });
      };

      sortMenus(rootMenus);
      
      ctx.log?.info({ userId, menuCount: rootMenus.length }, 'successfully_retrieved_user_menus');
      return rootMenus;

    } catch (error) {
      ctx.log?.error({ error: error.message, stack: error.stack }, 'repo_get_user_accessible_menus_error');
      throw error;
    }
  }

  async getUserMenuPermissions(userId, ctx = {}) {
    ctx.log?.info({ userId }, 'repo_get_user_menu_permissions');
    
    try {
      const user = await this.userModel.findByPk(userId, {
        include: [{
          model: this.roleModel,
          as: 'role',
          include: [{
            model: this.roleMenuPermissionModel,
            as: 'menuPermissions',
            include: [{
              model: this.menuModel,
              as: 'menu',
              attributes: ['id', 'title', 'url', 'icon', 'parent_id', 'order', 'is_active']
            }]
          }]
        }]
      });

      if (!user || !user.role) {
        ctx.log?.warn({ userId }, 'user_or_role_not_found');
        return [];
      }

      // Extract permissions from role
      const permissions = user.role.menuPermissions?.map(perm => ({
        menu_id: perm.menu.id,
        can_view: perm.can_view,
        can_create: perm.can_create,
        can_update: perm.can_update,
        can_delete: perm.can_delete,
        can_confirm: perm.can_confirm
      })) || [];

      ctx.log?.info({ userId, permissionCount: permissions.length }, 'successfully_retrieved_user_permissions');
      return permissions;

    } catch (error) {
      ctx.log?.error({ error: error.message, stack: error.stack }, 'repo_get_user_menu_permissions_error');
      throw error;
    }
  }

  async checkUserMenuAccess(userId, menuId, permission, ctx = {}) {
    ctx.log?.info({ userId, menuId, permission }, 'repo_check_user_menu_access');
    
    try {
      const user = await this.userModel.findByPk(userId, {
        include: [{
          model: this.roleModel,
          as: 'role',
          include: [{
            model: this.roleMenuPermissionModel,
            as: 'menuPermissions',
            where: { menu_id: menuId },
            include: [{
              model: this.menuModel,
              as: 'menu',
              where: { is_active: true }
            }]
          }]
        }]
      });

      if (!user || !user.role || !user.role.menuPermissions || user.role.menuPermissions.length === 0) {
        ctx.log?.warn({ userId, menuId }, 'user_no_menu_access');
        return false;
      }

      const menuPermission = user.role.menuPermissions[0];
      const hasAccess = menuPermission[permission] || false;
      
      ctx.log?.info({ userId, menuId, permission, hasAccess }, 'menu_access_check_result');
      return hasAccess;

    } catch (error) {
      ctx.log?.error({ error: error.message, stack: error.stack }, 'repo_check_user_menu_access_error');
      throw error;
    }
  }
}

module.exports = UserAccessMenuRepository;
