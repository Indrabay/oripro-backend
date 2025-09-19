class MapTenantCategoryRepository {
  constructor(mapTenantCategoryModel) {
    this.mapTenantCategoryModel = mapTenantCategoryModel;
  }

  async create(data, tx = null) {
    return this.mapTenantCategoryModel.create(data, { transaction: tx })
  }

  async findByTenantID(tenantID) {
    return this.mapTenantCategoryModel.findAll({
      where: { tenant_id: tenantID }
    })
  }
}

module.exports = MapTenantCategoryRepository;
