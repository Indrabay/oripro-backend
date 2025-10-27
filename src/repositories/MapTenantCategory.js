class MapTenantCategoryRepository {
  constructor(mapTenantCategoryModel) {
    this.mapTenantCategoryModel = mapTenantCategoryModel;
  }

  async create(data, tx = null, ctx) {
    try {
      ctx.log?.info(data, "MapTenantCategoryRepository.create");
      return this.mapTenantCategoryModel.create(data, { transaction: tx })
    } catch (error) {
      ctx.log?.error(data, "MapTenantCategoryRepository.create_error");
      throw new Error(`error when create map tenant category. with err: ${error.message}`);
    }
  }

  async findByTenantID(tenantID) {
    return this.mapTenantCategoryModel.findAll({
      where: { tenant_id: tenantID }
    })
  }

  async deleteByTenantId(tenantId, ctx) {
    try {
      ctx.log?.info({ tenant_id: tenantId }, "MapTenantCategoryRepository.deleteByTenantId");
      const deleted = await this.mapTenantCategoryModel.destroy({
        where: { tenant_id: tenantId },
        transaction: ctx.transaction
      });
      return deleted > 0;
    } catch (error) {
      ctx.log?.error({ tenant_id: tenantId }, `MapTenantCategoryRepository.deleteByTenantId_error: ${error.message}`);
      throw error;
    }
  }
}

module.exports = MapTenantCategoryRepository;
