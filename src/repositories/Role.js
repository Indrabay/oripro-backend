class RoleRepository {
  constructor(roleModel, roleMenuPermissionModel) {
    this.roleModel = roleModel
    this.roleMenuPermissionModel = roleMenuPermissionModel
  }
  // If you need findNameById, refactor to use Sequelize:
  async findNameById({id}, ctx = {}) {
    ctx.log?.info({ id }, 'repo find by id');
    const role = await this.roleModel.findByPk(id);
    return role ? role.name : null;
  }
  async create({ name, level }, ctx = {}) {
    ctx.log?.info({ name }, 'repo_create_role');
    const role = await this.roleModel.create({ name, level });
    return role.toJSON();
  }
  async findById(id, ctx = {}) {
    ctx.log?.debug({ id }, 'repo_find_role_by_id');
    const role = await this.roleModel.findByPk(id);
    return role ? role.toJSON() : null;
  }

  async findByIdWithMenuPermissions(id, ctx = {}) {
    ctx.log?.debug({ id }, 'repo_find_role_by_id_with_permissions');
    try {
      const role = await this.roleModel.findByPk(id, {
        include: [{
          model: this.roleMenuPermissionModel,
          as: 'menuPermissions',
          include: [{
            model: this.roleMenuPermissionModel.sequelize.models.Menu,
            as: 'menu'
          }]
        }]
      });
      
      if (role) {
        const roleData = role.toJSON();
        ctx.log?.debug({ roleData }, 'repo_find_role_by_id_with_permissions_success');
        return roleData;
      }
      return null;
    } catch (error) {
      ctx.log?.error({ error: error.message }, 'repo_find_role_by_id_with_permissions_error');
      
      // Fallback: get role and permissions separately
      try {
        const role = await this.roleModel.findByPk(id);
        if (!role) return null;
        
        const permissions = await this.getMenuPermissions(id, ctx);
        const roleData = role.toJSON();
        roleData.menuPermissions = permissions;
        
        ctx.log?.debug({ roleData }, 'repo_find_role_by_id_with_permissions_fallback');
        return roleData;
      } catch (fallbackError) {
        ctx.log?.error({ error: fallbackError.message }, 'repo_find_role_by_id_with_permissions_fallback_error');
        const role = await this.roleModel.findByPk(id);
        return role ? role.toJSON() : null;
      }
    }
  }
  async findByName(name, ctx = {}) {
    ctx.log?.debug({ name }, 'repo_find_role_by_name');
    const role = await this.roleModel.findOne({ where: { name } });
    return role ? role.toJSON() : null;
  }
  async listAll(ctx = {}) {
    ctx.log?.info({}, 'repo_list_all_roles');
    const roles = await this.roleModel.findAll({ order: [['level', 'DESC']] });
    return roles.map(r => r.toJSON());
  }
  async update(id, { name, level }, ctx = {}) {
    ctx.log?.info({ id }, 'repo_update_role');
    const role = await this.roleModel.findByPk(id);
    if (!role) return null;
    await role.update({ name: name ?? role.name, level: level ?? role.level });
    return role.toJSON();
  }
  async delete(id, ctx = {}) {
    ctx.log?.info({ id }, 'repo_delete_role');
    const deleted = await this.roleModel.destroy({ where: { id } });
    return deleted > 0;
  }

  async getMenuPermissions(roleId, ctx = {}) {
    ctx.log?.info({ roleId }, 'repo_get_menu_permissions');
    try {
      const permissions = await this.roleMenuPermissionModel.findAll({
        where: { role_id: roleId },
        include: [{
          model: this.roleMenuPermissionModel.sequelize.models.Menu,
          as: 'menu'
        }]
      });
      return permissions.map(p => p.toJSON());
    } catch (error) {
      ctx.log?.error({ error: error.message }, 'repo_get_menu_permissions_error');
      // Fallback to simple query if association fails
      const permissions = await this.roleMenuPermissionModel.findAll({
        where: { role_id: roleId }
      });
      return permissions.map(p => p.toJSON());
    }
  }

  async setMenuPermissions(roleId, menuPermissions, ctx = {}) {
    ctx.log?.info({ roleId, menuPermissions }, 'repo_set_menu_permissions');
    
    // Delete existing permissions for this role
    await this.roleMenuPermissionModel.destroy({
      where: { role_id: roleId }
    });

    // Create new permissions
    if (menuPermissions && menuPermissions.length > 0) {
      const permissionsToCreate = menuPermissions.map(perm => ({
        role_id: roleId,
        menu_id: perm.menu_id,
        can_view: perm.can_view,
        can_create: perm.can_create,
        can_update: perm.can_update,
        can_delete: perm.can_delete,
        can_confirm: perm.can_confirm
      }));

      await this.roleMenuPermissionModel.bulkCreate(permissionsToCreate);
    }
  }
}

module.exports = RoleRepository;


