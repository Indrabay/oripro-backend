const User = require('../models/User');

class UserRepository {
  constructor() {}

  async findByEmail(email, ctx = {}) {
    ctx.log?.debug({ email }, 'repo_find_user_by_email');
    const user = await User.findOne({
      where: { email },
    });
    return user ? user.toJSON() : null;
  }

  async findById(id, ctx = {}) {
    ctx.log?.debug({ id }, 'repo_find_user_by_id');
    const user = await User.findByPk(id);
    return user ? user.toJSON() : null;
  }

  async create({ email, password, name, roleId, createdBy }, ctx = {}) {
    ctx.log?.info({ email }, 'repo_create_user');
    const user = await User.create({
      email,
      password,
      name,
      role_id: roleId,
      created_by: createdBy
    });
    return user.toJSON();
  }

  async updatePassword(userId, password, ctx = {}) {
    ctx.log?.info({ userId }, 'repo_update_password');
    const user = await User.findByPk(userId);
    if (!user) return null;
    await user.update({ password, updated_at: new Date(), updated_by: userId });
    return user.toJSON();
  }

  async listAll(ctx = {}) {
    ctx.log?.info({}, 'repo_list_all_users');
    const users = await User.findAll({ order: [['created_at', 'DESC']] });
    return users.map(u => u.toJSON());
  }

  async update(id, userData, ctx = {}) {
    ctx.log?.info({ id }, 'repo_update_user');
    const user = await User.findByPk(id);
    if (!user) return null;
    await user.update({
      email: userData.email ?? user.email,
      name: userData.name ?? user.name,
      role_id: userData.roleId ?? user.role_id,
      updated_by: userData.updatedBy ?? user.updated_by,
      updated_at: new Date()
    });
    return user.toJSON();
  }

  async delete(id, ctx = {}) {
    ctx.log?.info({ id }, 'repo_delete_user');
    const deleted = await User.destroy({ where: { id } });
    return deleted > 0;
  }
}

module.exports = { UserRepository };

