class TenantPaymentLogRepository {
  constructor(tenantPaymentLogModel, tenantModel, userModel) {
    this.tenantPaymentLogModel = tenantPaymentLogModel;
    this.tenantModel = tenantModel;
    this.userModel = userModel;
  }

  async create(data, ctx = {}, tx = null) {
    try {
      ctx.log?.info(data, 'TenantPaymentLogRepository.create');
      const now = new Date();
      const paymentLog = await this.tenantPaymentLogModel.create({
        tenant_id: data.tenant_id,
        amount: data.amount,
        payment_date: data.payment_date,
        payment_method: data.payment_method,
        notes: data.notes || null,
        created_by: data.created_by || ctx.userId || null,
        updated_by: data.updated_by || ctx.userId || null,
        created_at: now,
        updated_at: now,
      }, { transaction: tx });
      return paymentLog.toJSON();
    } catch (error) {
      ctx.log?.error({ data, error }, 'TenantPaymentLogRepository.create_error');
      throw error;
    }
  }

  async findById(id, ctx = {}) {
    try {
      ctx.log?.info({ id }, 'TenantPaymentLogRepository.findById');
      const paymentLog = await this.tenantPaymentLogModel.findByPk(id, {
        include: [
          {
            model: this.tenantModel,
            as: 'tenant',
            attributes: ['id', 'name', 'code']
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
          }
        ]
      });
      if (!paymentLog) return null;
      return paymentLog.toJSON();
    } catch (error) {
      ctx.log?.error({ id, error }, 'TenantPaymentLogRepository.findById_error');
      throw error;
    }
  }

  async findByTenantId(tenantId, queryParams = {}, ctx = {}) {
    try {
      ctx.log?.info({ tenantId, queryParams }, 'TenantPaymentLogRepository.findByTenantId');
      const { limit = 10, offset = 0, orderBy = 'created_at', order = 'DESC' } = queryParams;
      
      const { rows, count } = await this.tenantPaymentLogModel.findAndCountAll({
        where: { tenant_id: tenantId },
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [[orderBy, order]],
        include: [
          {
            model: this.userModel,
            as: 'createdBy',
            attributes: ['id', 'name', 'email']
          },
          {
            model: this.userModel,
            as: 'updatedBy',
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      return {
        rows: rows.map(row => row.toJSON()),
        count,
        limit: parseInt(limit),
        offset: parseInt(offset)
      };
    } catch (error) {
      ctx.log?.error({ tenantId, queryParams, error }, 'TenantPaymentLogRepository.findByTenantId_error');
      throw error;
    }
  }

  async update(id, data, ctx = {}, tx = null) {
    try {
      ctx.log?.info({ id, data }, 'TenantPaymentLogRepository.update');
      const updateData = {
        ...data,
        updated_at: new Date(),
        updated_by: data.updated_by || ctx.userId || null,
      };
      await this.tenantPaymentLogModel.update(updateData, {
        where: { id },
        transaction: tx
      });
      const paymentLog = await this.findById(id, ctx);
      return paymentLog;
    } catch (error) {
      ctx.log?.error({ id, data, error }, 'TenantPaymentLogRepository.update_error');
      throw error;
    }
  }

  async delete(id, ctx = {}, tx = null) {
    try {
      ctx.log?.info({ id }, 'TenantPaymentLogRepository.delete');
      await this.tenantPaymentLogModel.destroy({
        where: { id },
        transaction: tx
      });
      return true;
    } catch (error) {
      ctx.log?.error({ id, error }, 'TenantPaymentLogRepository.delete_error');
      throw error;
    }
  }
}

module.exports = TenantPaymentLogRepository;

