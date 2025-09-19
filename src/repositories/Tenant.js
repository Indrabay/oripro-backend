

class TenantRepository {
  constructor(tenantModel) {
    this.tenantModel = tenantModel
  }
  async create(data, tx = null) {
    return this.tenantModel.create(data, {transaction: tx});
  }

  async findById(id) {
    return this.tenantModel.findByPk(id);
  }

  async findAll(where = {}) {
    return this.tenantModel.findAll({ where });
  }

  async update(id, data) {
    const tenant = await this.tenantModel.findByPk(id);
    if (!tenant) return null;
    await tenant.update(data);
    return tenant;
  }

  async delete(id) {
    const tenant = await this.tenantModel.findByPk(id);
    if (!tenant) return null;
    await tenant.destroy();
    return true;
  }
}

module.exports = TenantRepository;
