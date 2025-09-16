class TenantUseCase { 
  constructor(tenantUsecase) {
    this.tenantUsecase = tenantUsecase;
  }

  async createTenant(data) {
    return this.tenantUsecase.create(data);
  }

  async getTenantById(id) {
    return this.tenantUsecase.findById(id);
  }

  async getAllTenants(filter = {}) {
    return this.tenantUsecase.findAll(filter);
  }

  async updateTenant(id, data) {
    return this.tenantUsecase.update(id, data);
  }

  async deleteTenant(id) {
    return this.tenantUsecase.delete(id);
  }
}

module.exports = TenantUseCase;
