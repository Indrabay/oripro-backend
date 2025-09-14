const Role = require('../models/Role');

class RoleRepository {
  constructor() {}
  // If you need findNameById, refactor to use Sequelize:
  async findNameById({id}, ctx = {}) {
    ctx.log?.info({ id }, 'repo find by id');
    const role = await Role.findByPk(id);
    return role ? role.name : null;
  }
  async create({ name, level }, ctx = {}) {
    ctx.log?.info({ name }, 'repo_create_role');
    const role = await Role.create({ name, level });
    return role.toJSON();
  }
  async findById(id, ctx = {}) {
    ctx.log?.debug({ id }, 'repo_find_role_by_id');
    const role = await Role.findByPk(id);
    return role ? role.toJSON() : null;
  }
  async findByName(name, ctx = {}) {
    ctx.log?.debug({ name }, 'repo_find_role_by_name');
    const role = await Role.findOne({ where: { name } });
    return role ? role.toJSON() : null;
  }
  async listAll(ctx = {}) {
    ctx.log?.info({}, 'repo_list_all_roles');
    const roles = await Role.findAll({ order: [['level', 'DESC']] });
    return roles.map(r => r.toJSON());
  }
  async update(id, { name, level }, ctx = {}) {
    ctx.log?.info({ id }, 'repo_update_role');
    const role = await Role.findByPk(id);
    if (!role) return null;
    await role.update({ name: name ?? role.name, level: level ?? role.level });
    return role.toJSON();
  }
  async delete(id, ctx = {}) {
    ctx.log?.info({ id }, 'repo_delete_role');
    const deleted = await Role.destroy({ where: { id } });
    return deleted > 0;
  }

  async findNameById(id) {
    const { rows } = await this.pool.query('SELECT name FROM roles WHERE id = $1', [id]);
    return rows[0]?.name || null;
  }
}

module.exports = RoleRepository;


