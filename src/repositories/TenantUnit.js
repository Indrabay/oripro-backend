class TenantUnitRepository {
  constructor(tenantUnitModel) {
    this.tenantUnitModel = tenantUnitModel;
  }

  async create(data, tx) {
    return this.tenantUnitModel.create(data, {transaction: tx});
  }

  async getByTenantID(id) {
    return this.tenantUnitModel.findAll({
      where: { tenant_id: id }
    })
  }
}

module.exports = TenantUnitRepository;
