class TenantUsecase {
  constructor(tenantRepository) {
    this.tenantRepository = tenantRepository;
  }
  
  async findById({ id }, ctx = {}) {
    ctx.log?.info({ id }, 'usecase_find_tenant_by_id');
    return this.tenantRepository.findById(id, ctx);
  }

  async create({ name, domain }, ctx = {}) {
    ctx.log?.info({ name }, 'usecase_create_tenant');
    return this.tenantRepository.create({ name, domain }, ctx);
  }

  async listAll(ctx = {}) {
    ctx.log?.info({}, 'usecase_list_all_tenants');
    return this.tenantRepository.listAll(ctx);
  }

  async update(id, { name, domain }, ctx = {}) {
    ctx.log?.info({ id }, 'usecase_update_tenant');
    return this.tenantRepository.update(id, { name, domain }, ctx);
  }

  async delete(id, ctx = {}) {
    ctx.log?.info({ id }, 'usecase_delete_tenant');
    return this.tenantRepository.delete(id, ctx);
  }
}

module.exports = TenantUsecase;