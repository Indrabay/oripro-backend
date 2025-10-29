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
            required: true,
            include: [{
              model: this.menuModel,
              as: 'menu',
              where: { is_active: true },
              required: true,
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

      // Collect all parent IDs that need to be fetched
      const parentIds = new Set();
      accessibleMenus.forEach(menu => {
        if (menu.parent_id) {
          parentIds.add(menu.parent_id);
        }
      });

      // Fetch parent menus that are not in accessibleMenus but are parents of accessible menus
      const parentMenus = [];
      if (parentIds.size > 0) {
        const accessibleMenuIds = new Set(accessibleMenus.map(m => m.id));
        const missingParentIds = Array.from(parentIds).filter(id => !accessibleMenuIds.has(id));
        
        if (missingParentIds.length > 0) {
          // Check if parent menus have permissions in roleMenuPermission
          const parentPermissions = await this.roleMenuPermissionModel.findAll({
            where: {
              role_id: user.role.id,
              menu_id: missingParentIds
            },
            include: [{
              model: this.menuModel,
              as: 'menu',
              where: { is_active: true },
              required: true,
              attributes: ['id', 'title', 'url', 'icon', 'parent_id', 'order', 'is_active']
            }]
          });

          // Create a map of parent permissions by menu_id
          const parentPermissionMap = new Map();
          parentPermissions.forEach(perm => {
            parentPermissionMap.set(perm.menu.id, {
              can_view: perm.can_view,
              can_create: perm.can_create,
              can_update: perm.can_update,
              can_delete: perm.can_delete,
              can_confirm: perm.can_confirm
            });
          });

          // Fetch parent menus
          const parents = await this.menuModel.findAll({
            where: {
              id: missingParentIds,
              is_active: true
            },
            attributes: ['id', 'title', 'url', 'icon', 'parent_id', 'order', 'is_active']
          });

          // Add parent menus with permissions from roleMenuPermission or default permissions
          parents.forEach(parent => {
            const permissions = parentPermissionMap.get(parent.id);
            parentMenus.push({
              id: parent.id,
              title: parent.title,
              url: parent.url,
              icon: parent.icon,
              parent_id: parent.parent_id,
              order: parent.order,
              is_active: parent.is_active,
              // If parent has permission, use it; otherwise default to can_view: true 
              // (parent will be filtered based on whether it has accessible children)
              can_view: permissions ? permissions.can_view : true,
              can_create: permissions ? permissions.can_create : false,
              can_update: permissions ? permissions.can_update : false,
              can_delete: permissions ? permissions.can_delete : false,
              can_confirm: permissions ? permissions.can_confirm : false
            });
          });
        }
      }

      // Combine accessible menus with parent menus
      const allMenus = [...accessibleMenus, ...parentMenus];

      // Build hierarchical menu structure
      const menuMap = new Map();
      const rootMenus = [];

      // First pass: create menu objects
      allMenus.forEach(menu => {
        menuMap.set(menu.id, { ...menu, children: [] });
      });

      // Second pass: build hierarchy
      allMenus.forEach(menu => {
        if (menu.parent_id && menuMap.has(menu.parent_id)) {
          menuMap.get(menu.parent_id).children.push(menuMap.get(menu.id));
        } else if (!menu.parent_id) {
          rootMenus.push(menuMap.get(menu.id));
        }
      });

      // Filter: Only include menus that have can_view permission or have children with can_view
      // Parent menus are always shown if they have at least one accessible child
      const filterAccessibleMenus = (menus) => {
        return menus.filter(menu => {
          // If menu has children, filter children first
          if (menu.children && menu.children.length > 0) {
            menu.children = filterAccessibleMenus(menu.children);
            // Keep menu if it has accessible children (even if parent doesn't have can_view)
            // OR if it has can_view permission itself
            return menu.children.length > 0 || menu.can_view;
          }
          // Leaf menu: only keep if it has can_view permission
          return menu.can_view === true;
        });
      };

      const filteredRootMenus = filterAccessibleMenus(rootMenus);

      // Sort menus by order
      const sortMenus = (menus) => {
        menus.sort((a, b) => a.order - b.order);
        menus.forEach(menu => {
          if (menu.children.length > 0) {
            sortMenus(menu.children);
          }
        });
      };

      sortMenus(filteredRootMenus);
      
      ctx.log?.info({ userId, menuCount: filteredRootMenus.length }, 'successfully_retrieved_user_menus');
      return filteredRootMenus;

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
