const sequelize = require("../models/sequelize");
const { PaymentLogStatusIntToStr } = require("../models/TenantPaymentLog");

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
      // payment_date, paid_amount, and payment_deadline can be null initially
      // If payment_date is provided, status should be "paid" and paid_amount should equal amount
      const hasPaymentDate = data.payment_date != null;
      const paymentLog = await this.tenantPaymentLogRepository.create({
        tenant_id: data.tenant_id,
        amount: data.amount,
        paid_amount: hasPaymentDate ? data.amount : null, // Set to amount if payment_date is provided
        payment_date: data.payment_date || null, // Use provided payment_date or null
        payment_deadline: data.payment_deadline || null, // Payment deadline (optional)
        payment_method: data.payment_method,
        status: hasPaymentDate ? 1 : 0, // 1 = paid if payment_date is provided, 0 = unpaid otherwise
        notes: data.notes,
        created_by: ctx.userId,
        updated_by: ctx.userId,
      }, ctx);

      // Convert status back to string for response
      if (paymentLog && paymentLog.status !== undefined) {
        paymentLog.status = PaymentLogStatusIntToStr[paymentLog.status] || paymentLog.status;
      }

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

      // Convert status from string to integer if provided
      const updateData = { ...data };
      if (updateData.status && typeof updateData.status === 'string') {
        const { PaymentLogStatusStrToInt } = require("../models/TenantPaymentLog");
        updateData.status = PaymentLogStatusStrToInt[updateData.status];
        if (updateData.status === undefined) {
          throw new Error(`Invalid status: ${data.status}. Must be 'unpaid', 'paid', or 'expired'`);
        }
      }

      // Update payment log
      const updatedPaymentLog = await this.tenantPaymentLogRepository.update(id, {
        ...updateData,
        updated_by: ctx.userId,
      }, ctx);
      
      // Convert status back to string for response
      if (updatedPaymentLog && updatedPaymentLog.status !== undefined) {
        updatedPaymentLog.status = PaymentLogStatusIntToStr[updatedPaymentLog.status] || updatedPaymentLog.status;
      }

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

