class TenantRepository {
  constructor(tenantModel) {
    this.tenantModel = tenantModel;
  }
  async findById(id, ctx = {}) {
    ctx.log?.debug({ id }, 'repo_find_tenant_by_id');
    const tenant = await this.tenantModel.findByPk(id);
    return tenant ? tenant.toJSON() : null;
  }
  async create({ name, domain }, ctx = {}) {
    ctx.log?.info({ name }, 'repo_create_tenant');
    const tenant = await this.tenantModel.create({ name, domain });
    return tenant.toJSON();
  }
  async listAll(ctx = {}) {
    ctx.log?.info({}, 'repo_list_all_tenants');
    const tenants = await this.tenantModel.findAll({ order: [['createdAt', 'DESC']] });
    return tenants.map(t => t.toJSON());
  }
  async update(id, { name, domain }, ctx = {}) {
    ctx.log?.info({ id }, 'repo_update_tenant');
    const tenant = await this.tenantModel.findByPk(id);
    if (!tenant) return null;
    await tenant.update({ name: name ?? tenant.name, domain: domain ?? tenant.domain });
    return tenant.toJSON();
  }
  async delete(id, ctx = {}) {
    ctx.log?.info({ id }, 'repo_delete_tenant');
    const deleted = await this.tenantModel.destroy({ where: { id } });
    return deleted > 0;
  }
}

module.exports = TenantRepository;