class UserRepository {
  constructor(userModel) {
    this.userModel = userModel
  }

  async findByEmail(email, ctx = {}) {
    ctx.log?.debug({ email }, 'repo_find_user_by_email');
    const user = await this.userModel.findOne({
      where: { email },
    });
    return user ? user.toJSON() : null;
  }

  async findById(id, ctx = {}) {
    ctx.log?.debug({ id }, 'repo_find_user_by_id');
    try {
      // Try to get Role model from sequelize
      const RoleModel = this.userModel.sequelize.models.Role;
      if (!RoleModel) {
        throw new Error('Role model not found');
      }
      
      const user = await this.userModel.findByPk(id, {
        include: [{
          model: RoleModel,
          as: 'role',
          attributes: ['id', 'name', 'level']
        }]
      });
      return user ? user.toJSON() : null;
    } catch (error) {
      ctx.log?.error({ error: error.message }, 'repo_find_user_by_id_error');
      // Fallback: get user and role separately, then join manually
      try {
        const user = await this.userModel.findByPk(id);
        if (!user) return null;
        
        const userData = user.toJSON();
        
        const RoleModel = this.userModel.sequelize.models.Role;
        if (RoleModel && userData.role_id) {
          const role = await RoleModel.findByPk(userData.role_id, {
            attributes: ['id', 'name', 'level']
          });
          if (role) {
            userData.role = role.toJSON();
          }
        }
        
        return userData;
      } catch (fallbackError) {
        ctx.log?.error({ error: fallbackError.message }, 'repo_find_user_by_id_fallback_error');
        return null;
      }
    }
  }

  async create({ email, password, name, roleId, status, createdBy }, ctx = {}) {
    ctx.log?.info({ email }, 'repo_create_user');
    const user = await this.userModel.create({
      email,
      password,
      name,
      role_id: roleId,
      status: status || 'active',
      created_by: createdBy
    });
    return user.toJSON();
  }

  async updatePassword(userId, password, ctx = {}) {
    ctx.log?.info({ userId }, 'repo_update_password');
    const user = await this.userModel.findByPk(userId);
    if (!user) return null;
    await user.update({ password, updated_at: new Date(), updated_by: userId });
    return user.toJSON();
  }

  async listAll(ctx = {}) {
    ctx.log?.info({}, 'repo_list_all_users');
    try {
      // Try to get Role model from sequelize
      const RoleModel = this.userModel.sequelize.models.Role;
      if (!RoleModel) {
        throw new Error('Role model not found');
      }
      
      const users = await this.userModel.findAll({ 
        include: [{
          model: RoleModel,
          as: 'role',
          attributes: ['id', 'name', 'level']
        }],
        order: [['created_at', 'DESC']] 
       });
      return users.map(u => u.toJSON());
    } catch (error) {
      ctx.log?.error({ error: error.message }, 'repo_list_all_users_error');
      // Fallback: get users and roles separately, then join manually
      try {
        const users = await this.userModel.findAll({
          order: [['created_at', 'DESC']]
        });
        
        const RoleModel = this.userModel.sequelize.models.Role;
        if (RoleModel) {
          const roles = await RoleModel.findAll({
            attributes: ['id', 'name', 'level']
          });
          
          // Create a map of roles for quick lookup
          const roleMap = new Map();
          roles.forEach(role => {
            roleMap.set(role.id, role.toJSON());
          });
          
          // Add role information to users
          return users.map(user => {
            const userData = user.toJSON();
            const role = roleMap.get(userData.role_id);
            if (role) {
              userData.role = role;
            }
            return userData;
          });
        }
        
        return users.map(u => u.toJSON());
      } catch (fallbackError) {
        ctx.log?.error({ error: fallbackError.message }, 'repo_list_all_users_fallback_error');
        return [];
      }
    }
  }

  async update(id, userData, ctx = {}) {
    ctx.log?.info({ id }, 'repo_update_user');
    const user = await this.userModel.findByPk(id);
    if (!user) return null;
    await user.update({
      email: userData.email ?? user.email,
      password: userData.password ?? user.password,
      name: userData.name ?? user.name,
      role_id: userData.roleId ?? user.role_id,
      status: userData.status ?? user.status,
      updated_by: userData.updatedBy ?? user.updated_by,
      updated_at: new Date()
    });
    return user.toJSON();
  }

  async delete(id, ctx = {}) {
    ctx.log?.info({ id }, 'repo_delete_user');
    const deleted = await this.userModel.destroy({ where: { id } });
    return deleted > 0;
  }

  async getUserPermissions(userId, ctx = {}) {
    ctx.log?.info({ userId }, 'repo_get_user_permissions');
    const user = await this.userModel.findByPk(userId, {
      include: [{
        model: this.userModel.sequelize.models.Role,
        as: 'role',
        include: [{
          model: this.userModel.sequelize.models.RoleMenuPermission,
          as: 'menuPermissions',
          include: [{
            model: this.userModel.sequelize.models.Menu,
            as: 'menu',
            attributes: ['id', 'title', 'url', 'icon', 'parent_id', 'order', 'is_active']
          }]
        }]
      }]
    });

    if (!user || !user.role) {
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

    return permissions;
  }
}

module.exports = UserRepository;

