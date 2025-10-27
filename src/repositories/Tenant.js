const { Op } = require("sequelize");

class TenantRepository {
  constructor(tenantModel, userModel) {
    this.tenantModel = tenantModel;
    this.userModel = userModel;
  }
  async create(data, tx = null, ctx) {
    try {
      ctx.log?.info(data, "TenantRepository.create");
      return this.tenantModel.create(data, { transaction: tx });
    } catch (error) {
      ctx.log?.error(data, "TenantRepository.create_error");
      throw new Error(`error create tenant. with err: ${error.message}`);
    }
  }

  async findById(id, ctx) {
    try {
      ctx.log?.info({tenant_id: id}, "TenantRepository.findById");
      const tenant = await this.tenantModel.findByPk(id, {
      include: [
        {
          model: this.userModel,
          as: "createdBy",
          attributes: ["id", "name", "email"],
        },
        {
          model: this.userModel,
          as: "user",
          attributes: ["id", "name", "email"],
        },
        {
          model: this.userModel,
          as: "updatedBy",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    let result = tenant.toJSON();
    result.created_by = result.createdBy;
    result.updated_by = result.updatedBy;
    // Keep user_id for frontend
    // delete result.user_id
    delete result.createdBy;
    delete result.updatedBy;
    return result;
    } catch (error) {
      ctx.log?.error({tenant_id: id}, `TenantRepository.findById_error: ${error.message}`);
      throw error;
    }
  }

  async findAll(filter = {}, ctx) {
    try {
      let whereQuery = {};
      if (filter.name || filter.user_id || filter.status) {
        whereQuery.where = {};
        if (filter.name) {
          let filterName = filter.name.toLowerCase();
          whereQuery.where.name = {
            [Op.like]: `%${filterName}%`,
          };
        }

        if (filter.status) {
          whereQuery.where.status = filter.status;
        }
      }

      whereQuery.include = [
        {
          model: this.userModel,
          as: 'createdBy',
          attributes: ['id', 'name', 'email']
        },
        {
          model: this.userModel,
          as: 'updatedBy',
          attributes: ['id', 'name', 'email']
        },
        {
          model: this.userModel,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
      ]
      const data = await this.tenantModel.findAndCountAll(whereQuery);
      return {
        tenants: data.rows.map(t => {
          let tenant = t.toJSON();
          tenant.created_by = tenant.createdBy;
          tenant.updated_by = tenant.updatedBy;

          delete tenant.createdBy;
          delete tenant.updatedBy;

          return tenant;
        }),
        total: data.count
      }
    } catch (error) {
      ctx.log?.error(filter, "TenantRepository.findAll_error");
      throw new Error(`error when get tenants. with err: ${error.message}`);
    }
  }

  async update(id, data) {
    const tenant = await this.tenantModel.findByPk(id);
    if (!tenant) return null;
    
    // Convert rent_duration_unit from string to integer if needed
    const updateData = { ...data };
    if (updateData.rent_duration_unit && typeof updateData.rent_duration_unit === 'string') {
      const { DurationUnit } = require('../models/Tenant');
      updateData.rent_duration_unit = DurationUnit[updateData.rent_duration_unit];
    }
    
    await tenant.update(updateData);
    return tenant;
  }

  async delete(id, ctx) {
    try {
      ctx.log?.info({ tenant_id: id }, "TenantRepository.delete");
      
      const tenant = await this.tenantModel.findByPk(id, {
        transaction: ctx.transaction
      });
      if (!tenant) {
        throw new Error('Tenant not found');
      }
      
      await tenant.destroy({
        transaction: ctx.transaction
      });
      return true;
    } catch (error) {
      ctx.log?.error({ tenant_id: id }, `TenantRepository.delete_error: ${error.message}`);
      throw error;
    }
  }
}

module.exports = TenantRepository;
