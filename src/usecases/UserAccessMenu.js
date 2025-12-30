class UserAccessMenuUsecase {
  constructor(userAccessMenuRepository) {
    this.userAccessMenuRepository = userAccessMenuRepository;
  }

  async getUserAccessibleMenus(userId, ctx) {
    ctx.log?.info({ userId }, 'usecase_get_user_accessible_menus');
    
    try {
      const menus = await this.userAccessMenuRepository.getUserAccessibleMenus(userId, ctx);
      
      ctx.log?.info({ userId, menuCount: menus.length }, 'usecase_get_user_accessible_menus_success');
      return menus;
    } catch (error) {
      ctx.log?.error({ error: error.message, stack: error.stack }, 'usecase_get_user_accessible_menus_error');
      throw error;
    }
  }

  async getUserMenuPermissions(userId, ctx) {
    ctx.log?.info({ userId }, 'usecase_get_user_menu_permissions');
    
    try {
      const permissions = await this.userAccessMenuRepository.getUserMenuPermissions(userId, ctx);
      
      ctx.log?.info({ userId, permissionCount: permissions.length }, 'usecase_get_user_menu_permissions_success');
      return permissions;
    } catch (error) {
      ctx.log?.error({ error: error.message, stack: error.stack }, 'usecase_get_user_menu_permissions_error');
      throw error;
    }
  }

  async checkUserMenuAccess(userId, menuId, permission, ctx) {
    ctx.log?.info({ userId, menuId, permission }, 'usecase_check_user_menu_access');
    
    try {
      const hasAccess = await this.userAccessMenuRepository.checkUserMenuAccess(userId, menuId, permission, ctx);
      
      ctx.log?.info({ userId, menuId, permission, hasAccess }, 'usecase_check_user_menu_access_success');
      return hasAccess;
    } catch (error) {
      ctx.log?.error({ error: error.message, stack: error.stack }, 'usecase_check_user_menu_access_error');
      throw error;
    }
  }

  async checkUserMenuAccessByUrl(userId, url, permission = 'can_view', ctx) {
    ctx.log?.info({ userId, url, permission }, 'usecase_check_user_menu_access_by_url');
    
    try {
      const hasAccess = await this.userAccessMenuRepository.checkUserMenuAccessByUrl(userId, url, permission, ctx);
      
      ctx.log?.info({ userId, url, permission, hasAccess }, 'usecase_check_user_menu_access_by_url_success');
      return hasAccess;
    } catch (error) {
      ctx.log?.error({ error: error.message, stack: error.stack }, 'usecase_check_user_menu_access_by_url_error');
      throw error;
    }
  }

  async getUserSidebarData(userId, ctx) {
    ctx.log?.info({ userId }, 'usecase_get_user_sidebar_data');
    
    try {
      const menus = await this.getUserAccessibleMenus(userId, ctx);
      
      // Transform menus to sidebar format
      const sidebarData = {
        navMain: menus.map(menu => {
          const sidebarItem = {
            title: menu.title,
            url: menu.url || "#",
            icon: menu.icon, // Frontend akan handle konversi string ke LucideIcon
            isActive: menu.is_active,
            // Include permissions
            can_add: menu.can_create || false,
            can_edit: menu.can_update || false,
            can_delete: menu.can_delete || false,
          };
          
          // Only add items if menu has children
          if (menu.children && menu.children.length > 0) {
            sidebarItem.items = menu.children.map(child => ({
              title: child.title,
              url: child.url || "#",
              circleColor: this.getCircleColor(child.title),
              // Include permissions for child items
              can_add: child.can_create || false,
              can_edit: child.can_update || false,
              can_delete: child.can_delete || false,
            }));
          }
          
          return sidebarItem;
        })
      };
      
      ctx.log?.info({ userId, sidebarItemCount: sidebarData.navMain.length }, 'usecase_get_user_sidebar_data_success');
      return sidebarData;
    } catch (error) {
      ctx.log?.error({ error: error.message, stack: error.stack }, 'usecase_get_user_sidebar_data_error');
      throw error;
    }
  }

  getCircleColor(title) {
    const colorMap = {
      'Manage Users': 'bg-blue-600',
      'Manage Roles': 'bg-yellow-600',
      'Manage Menus': 'bg-purple-600',
      'Company': 'bg-primary',
      'Payment Method': 'bg-primary',
      'Notification': 'bg-yellow-500',
      'Notification Alert': 'bg-yellow-500',
    };
    
    return colorMap[title] || 'bg-gray-500';
  }
}

module.exports = UserAccessMenuUsecase;
