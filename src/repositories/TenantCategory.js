class TenantCategoryRepository {
  constructor(tenantCategoryModel) {
    this.tenantCategoryModel = tenantCategoryModel; 
  }

  async getByID(id) {
    return this.tenantCategoryModel.findOne({
      where: {id}
    })
  }
}

module.exports = TenantCategoryRepository;