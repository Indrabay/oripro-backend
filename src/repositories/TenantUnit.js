class TenantUnitRepository {
  constructor(tenantUnitModel) {
    this.tenantUnitModel = tenantUnitModel;
  }

  async create(data, tx, ctx) {
    try {
      ctx.log?.info(data, "TenantUnitRepository.create");
      return this.tenantUnitModel.create(data, {transaction: tx});
    } catch (error) {
      ctx.log?.error(data, "TenantUnitRepository.create_error");
      throw new Error(`error when create tenant unit. with err: ${error.message}`);
    }
  }

  async getByTenantID(id) {
    return this.tenantUnitModel.findAll({
      where: { tenant_id: id }
    })
  }
}

module.exports = TenantUnitRepository;
