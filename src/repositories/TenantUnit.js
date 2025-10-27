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

  async deleteByTenantId(tenantId, ctx) {
    try {
      ctx.log?.info({ tenant_id: tenantId }, "TenantUnitRepository.deleteByTenantId");
      const deleted = await this.tenantUnitModel.destroy({
        where: { tenant_id: tenantId },
        transaction: ctx.transaction
      });
      return deleted > 0;
    } catch (error) {
      ctx.log?.error({ tenant_id: tenantId }, `TenantUnitRepository.deleteByTenantId_error: ${error.message}`);
      throw error;
    }
  }
}

module.exports = TenantUnitRepository;
