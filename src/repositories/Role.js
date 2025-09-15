class RoleRepository {
  constructor(roleModel) {
    this.roleModel = roleModel
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
}

module.exports = RoleRepository;


