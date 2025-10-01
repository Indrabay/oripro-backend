class RoleUseCase {
  constructor(roleRepository) {
    this.roleRepository = roleRepository;
  }

  async listAllRoles(ctx = {}) {
    ctx.log?.info({}, 'usecase_list_all_roles');
    try {
      const roles = await this.roleRepository.listAll(ctx);
      return roles;
    } catch (error) {
      ctx.log?.error({ error: error.message }, 'usecase_list_all_roles_error');
      throw error;
    }
  }

  async getRoleById(id, ctx = {}) {
    ctx.log?.info({ id }, 'usecase_get_role_by_id');
    try {
      const role = await this.roleRepository.findByIdWithMenuPermissions(id, ctx);
      return role;
    } catch (error) {
      ctx.log?.error({ error: error.message }, 'usecase_get_role_by_id_error');
      throw error;
    }
  }

  async createRole(roleData, ctx = {}) {
    ctx.log?.info({ roleData }, 'usecase_create_role');
    try {
      const { menuPermissions, ...roleInfo } = roleData;
      const role = await this.roleRepository.create(roleInfo, ctx);
      
      // Handle menu permissions if provided
      if (menuPermissions && menuPermissions.length > 0) {
        await this.roleRepository.setMenuPermissions(role.id, menuPermissions, ctx);
      }
      
      return role;
    } catch (error) {
      ctx.log?.error({ error: error.message }, 'usecase_create_role_error');
      throw error;
    }
  }

  async updateRole(id, roleData, ctx = {}) {
    ctx.log?.info({ id, roleData }, 'usecase_update_role');
    try {
      const { menuPermissions, ...roleInfo } = roleData;
      const role = await this.roleRepository.update(id, roleInfo, ctx);
      
      // Handle menu permissions if provided
      if (menuPermissions !== undefined) {
        await this.roleRepository.setMenuPermissions(id, menuPermissions, ctx);
      }
      
      return role;
    } catch (error) {
      ctx.log?.error({ error: error.message }, 'usecase_update_role_error');
      throw error;
    }
  }

  async deleteRole(id, ctx = {}) {
    ctx.log?.info({ id }, 'usecase_delete_role');
    try {
      const deleted = await this.roleRepository.delete(id, ctx);
      return deleted;
    } catch (error) {
      ctx.log?.error({ error: error.message }, 'usecase_delete_role_error');
      throw error;
    }
  }

  async getRoleMenuPermissions(roleId, ctx = {}) {
    ctx.log?.info({ roleId }, 'usecase_get_role_menu_permissions');
    try {
      const permissions = await this.roleRepository.getMenuPermissions(roleId, ctx);
      return permissions;
    } catch (error) {
      ctx.log?.error({ error: error.message }, 'usecase_get_role_menu_permissions_error');
      throw error;
    }
  }

  async setRoleMenuPermissions(roleId, permissions, ctx = {}) {
    ctx.log?.info({ roleId, permissions }, 'usecase_set_role_menu_permissions');
    try {
      await this.roleRepository.setMenuPermissions(roleId, permissions, ctx);
    } catch (error) {
      ctx.log?.error({ error: error.message }, 'usecase_set_role_menu_permissions_error');
      throw error;
    }
  }
}

module.exports = RoleUseCase;
