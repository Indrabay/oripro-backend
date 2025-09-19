class TenantUnitRepository {
  constructor(tenantUnitModel) {
    this.tenantUnitModel = tenantUnitModel;
  }

  async create(data) {
    return this.tenantUnitModel.create(data);
  }

  async getByTenantID(id) {
    return this.tenantUnitModel.findAll({
      where: { tenant_id: id }
    })
  }
}

module.exports = TenantUnitRepository;