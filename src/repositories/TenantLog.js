class TenantLogRepository {
  constructor(tenantLogModel, userModel) {
    this.tenantLogModel = tenantLogModel;
    this.userModel = userModel;
  }

  async create(data, ctx) {
    try {
      ctx.log?.info(data, "TenantLogRepository.create");
      await this.tenantLogModel.create(data, {
        transaction: ctx.transaction
      });
    } catch (error) {
      ctx.log?.error(data, "TenantLogRepository.create_error");
      throw new Error(`error when create tenant log. with err: ${error.message}`);
    }
  }

  async findByTenantID(id, ctx) {
    ctx.log?.info({tenant_id: id}, "TenantLogRepository.findByTenantID");
    const tenantLogs = await this.tenantLogModel.findAll({
      where: { tenant_id: id },
      order: [['created_at', 'DESC']],
      include: [
        {
          model: this.userModel,
          as: 'createdBy',
          attributes: ['id', 'name', 'email']
        },
      ]
    })

    return tenantLogs.map(tl => {
      let tenantLog = tl.toJSON()
      tenantLog.created_by = tenantLog.createdBy
      delete tenantLog.createdBy

      return tenantLog
    })
  }
}

module.exports = TenantLogRepository;