const { Op } = require("sequelize");


class TenantRepository {
  constructor(tenantModel, userModel) {
    this.tenantModel = tenantModel
    this.userModel = userModel
  }
  async create(data, tx = null) {
    return this.tenantModel.create(data, {transaction: tx});
  }

  async findById(id) {
    const tenant = await this.tenantModel.findByPk(id, {
      include: [
        {
          model: this.userModel,
          as: 'createdBy',
          attributes: ['id', 'name', 'email']
        },
        {
          model: this.userModel,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: this.userModel,
          as: 'updatedBy',
          attributes: ['id', 'name', 'email']
        },
      ]
    });

    let result = tenant.toJSON();
    result.created_by = result.createdBy
    result.updated_by = result.updatedBy
    delete result.user_id
    delete result.createdBy
    delete result.updatedBy
    return result;
  }

  async findAll(filter = {}) {
    let whereQuery = {}
    if (filter.name || filter.user_id || filter.status) {
      whereQuery.where = {};
      if (filter.name) {
        let filterName = filter.name.toLowerCase();
        whereQuery.where.name = {
          [Op.like]: `%${filterName}%`
        };
      }

      if (filter.status) {
        whereQuery.where.status = filter.status;
      }
    }
    return this.tenantModel.findAll({ where });
  }

  async update(id, data) {
    const tenant = await this.tenantModel.findByPk(id);
    if (!tenant) return null;
    await tenant.update(data);
    return tenant;
  }
}

module.exports = TenantRepository;
