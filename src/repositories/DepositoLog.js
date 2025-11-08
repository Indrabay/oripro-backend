class DepositoLogRepository {
  constructor(depositoLogModel, userModel) {
    this.depositoLogModel = depositoLogModel;
    this.userModel = userModel;
  }

  async create(data, ctx = {}, tx = null) {
    try {
      ctx.log?.info(data, "DepositoLogRepository.create");
      const depositoLog = await this.depositoLogModel.create({
        tenant_id: data.tenant_id,
        old_deposit: data.old_deposit,
        new_deposit: data.new_deposit,
        reason: data.reason || null,
        created_by: data.created_by,
      }, {
        transaction: tx || ctx.transaction
      });
      return depositoLog.toJSON();
    } catch (error) {
      ctx.log?.error({ data, error: error.message }, "DepositoLogRepository.create_error");
      throw new Error(`error when create deposito log. with err: ${error.message}`);
    }
  }

  async findByTenantId(tenantId, ctx = {}) {
    try {
      ctx.log?.info({ tenant_id: tenantId }, "DepositoLogRepository.findByTenantId");
      const depositoLogs = await this.depositoLogModel.findAll({
        where: { tenant_id: tenantId },
        order: [['created_at', 'DESC']],
        include: [
          {
            model: this.userModel,
            as: 'createdBy',
            attributes: ['id', 'name', 'email']
          },
        ]
      });

      return depositoLogs.map(dl => {
        let depositoLog = dl.toJSON();
        depositoLog.created_by = depositoLog.createdBy;
        delete depositoLog.createdBy;
        return depositoLog;
      });
    } catch (error) {
      ctx.log?.error({ tenant_id: tenantId, error: error.message }, "DepositoLogRepository.findByTenantId_error");
      throw error;
    }
  }
}

module.exports = DepositoLogRepository;

