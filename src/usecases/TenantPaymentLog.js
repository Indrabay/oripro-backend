const sequelize = require("../models/sequelize");

class TenantPaymentLogUsecase {
  constructor(tenantPaymentLogRepository, tenantRepository) {
    this.tenantPaymentLogRepository = tenantPaymentLogRepository;
    this.tenantRepository = tenantRepository;
  }

  async createPaymentLog(data, ctx) {
    try {
      ctx.log?.info(data, "TenantPaymentLogUsecase.createPaymentLog");
      
      // Verify tenant exists
      const tenant = await this.tenantRepository.findById(data.tenant_id, ctx);
      if (!tenant) {
        throw new Error('Tenant not found');
      }

      // Create payment log
      const paymentLog = await this.tenantPaymentLogRepository.create({
        tenant_id: data.tenant_id,
        amount: data.amount,
        payment_date: data.payment_date || new Date(),
        payment_method: data.payment_method,
        notes: data.notes,
        created_by: ctx.userId,
        updated_by: ctx.userId,
      }, ctx);

      return paymentLog;
    } catch (error) {
      ctx.log?.error(
        { data, error: error.message },
        "TenantPaymentLogUsecase.createPaymentLog_error"
      );
      throw error;
    }
  }

  async updatePaymentLog(id, data, ctx) {
    try {
      ctx.log?.info({ id, data }, "TenantPaymentLogUsecase.updatePaymentLog");
      
      // Verify payment log exists
      const paymentLog = await this.tenantPaymentLogRepository.findById(id, ctx);
      if (!paymentLog) {
        throw new Error('Payment log not found');
      }

      // Update payment log
      const updatedPaymentLog = await this.tenantPaymentLogRepository.update(id, {
        ...data,
        updated_by: ctx.userId,
      }, ctx);

      return updatedPaymentLog;
    } catch (error) {
      ctx.log?.error(
        { id, data, error: error.message },
        "TenantPaymentLogUsecase.updatePaymentLog_error"
      );
      throw error;
    }
  }

  async getPaymentLogsByTenantId(tenantId, queryParams, ctx) {
    try {
      ctx.log?.info({ tenantId, queryParams }, "TenantPaymentLogUsecase.getPaymentLogsByTenantId");
      
      // Verify tenant exists
      const tenant = await this.tenantRepository.findById(tenantId, ctx);
      if (!tenant) {
        throw new Error('Tenant not found');
      }

      const result = await this.tenantPaymentLogRepository.findByTenantId(tenantId, queryParams, ctx);
      return result;
    } catch (error) {
      ctx.log?.error(
        { tenantId, queryParams, error: error.message },
        "TenantPaymentLogUsecase.getPaymentLogsByTenantId_error"
      );
      throw error;
    }
  }

  async getPaymentLogById(id, ctx) {
    try {
      ctx.log?.info({ id }, "TenantPaymentLogUsecase.getPaymentLogById");
      const paymentLog = await this.tenantPaymentLogRepository.findById(id, ctx);
      return paymentLog;
    } catch (error) {
      ctx.log?.error(
        { id, error: error.message },
        "TenantPaymentLogUsecase.getPaymentLogById_error"
      );
      throw error;
    }
  }

  async deletePaymentLog(id, ctx) {
    try {
      ctx.log?.info({ id }, "TenantPaymentLogUsecase.deletePaymentLog");
      
      // Verify payment log exists
      const paymentLog = await this.tenantPaymentLogRepository.findById(id, ctx);
      if (!paymentLog) {
        throw new Error('Payment log not found');
      }

      await this.tenantPaymentLogRepository.delete(id, ctx);
      return true;
    } catch (error) {
      ctx.log?.error(
        { id, error: error.message },
        "TenantPaymentLogUsecase.deletePaymentLog_error"
      );
      throw error;
    }
  }
}

module.exports = TenantPaymentLogUsecase;

