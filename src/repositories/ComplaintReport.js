const { Op } = require('sequelize');

class ComplaintReportRepository {
  constructor(complaintReportModel, userModel, tenantModel) {
    this.complaintReportModel = complaintReportModel;
    this.userModel = userModel;
    this.tenantModel = tenantModel;
  }

  async create(data, ctx = {}, tx = null) {
    try {
      ctx.log?.info(data, 'ComplaintReportRepository.create');
      const complaintReport = await this.complaintReportModel.create({
        type: data.type,
        title: data.title,
        description: data.description,
        reporter_id: data.reporter_id,
        tenant_id: data.tenant_id || null,
        status: data.status !== undefined ? data.status : 0,
        priority: data.priority !== undefined ? data.priority : 1,
        created_by: data.created_by,
        updated_by: data.updated_by || data.created_by,
      }, {
        transaction: tx || ctx.transaction
      });
      return complaintReport.toJSON();
    } catch (error) {
      ctx.log?.error({ data, error: error.message }, 'ComplaintReportRepository.create_error');
      throw error;
    }
  }

  async findById(id, ctx = {}) {
    try {
      ctx.log?.info({ id }, 'ComplaintReportRepository.findById');
      const complaintReport = await this.complaintReportModel.findByPk(id, {
        include: [
          {
            model: this.userModel,
            as: 'reporter',
            attributes: ['id', 'name', 'email']
          },
          {
            model: this.tenantModel,
            as: 'tenant',
            attributes: ['id', 'name', 'code'],
            required: false
          },
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
        ]
      });
      return complaintReport ? complaintReport.toJSON() : null;
    } catch (error) {
      ctx.log?.error({ id, error: error.message }, 'ComplaintReportRepository.findById_error');
      throw error;
    }
  }

  async findAll(filters = {}, ctx = {}) {
    try {
      ctx.log?.info({ filters }, 'ComplaintReportRepository.findAll');
      const whereClause = {};

      if (filters.type) {
        whereClause.type = filters.type;
      }
      if (filters.status !== undefined) {
        whereClause.status = filters.status;
      }
      if (filters.priority !== undefined) {
        whereClause.priority = filters.priority;
      }
      if (filters.reporter_id) {
        whereClause.reporter_id = filters.reporter_id;
      }
      if (filters.tenant_id) {
        whereClause.tenant_id = filters.tenant_id;
      }
      if (filters.title) {
        whereClause.title = {
          [Op.iLike]: `%${filters.title}%`
        };
      }

      const queryOptions = {
        where: whereClause,
        include: [
          {
            model: this.userModel,
            as: 'reporter',
            attributes: ['id', 'name', 'email']
          },
          {
            model: this.tenantModel,
            as: 'tenant',
            attributes: ['id', 'name', 'code'],
            required: false
          },
          {
            model: this.userModel,
            as: 'createdBy',
            attributes: ['id', 'name', 'email']
          },
        ],
        order: [['created_at', 'DESC']]
      };

      if (filters.limit) {
        queryOptions.limit = parseInt(filters.limit);
      }
      if (filters.offset) {
        queryOptions.offset = parseInt(filters.offset);
      }

      const { count, rows } = await this.complaintReportModel.findAndCountAll(queryOptions);

      return {
        complaintReports: rows.map(cr => cr.toJSON()),
        total: count
      };
    } catch (error) {
      ctx.log?.error({ filters, error: error.message }, 'ComplaintReportRepository.findAll_error');
      throw error;
    }
  }

  async update(id, data, ctx = {}, tx = null) {
    try {
      ctx.log?.info({ id, data }, 'ComplaintReportRepository.update');
      const updateData = {
        ...data,
        updated_at: new Date()
      };
      await this.complaintReportModel.update(updateData, {
        where: { id },
        transaction: tx || ctx.transaction
      });
      return await this.findById(id, ctx);
    } catch (error) {
      ctx.log?.error({ id, data, error: error.message }, 'ComplaintReportRepository.update_error');
      throw error;
    }
  }

  async delete(id, ctx = {}, tx = null) {
    try {
      ctx.log?.info({ id }, 'ComplaintReportRepository.delete');
      await this.complaintReportModel.destroy({
        where: { id },
        transaction: tx || ctx.transaction
      });
      return true;
    } catch (error) {
      ctx.log?.error({ id, error: error.message }, 'ComplaintReportRepository.delete_error');
      throw error;
    }
  }
}

module.exports = ComplaintReportRepository;

