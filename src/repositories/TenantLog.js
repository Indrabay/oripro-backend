class TenantLogRepository {
  constructor(tenantLogModel, userModel) {
    this.tenantLogModel = tenantLogModel;
    this.userModel = userModel;
  }

  async create(data, ctx) {
    ctx.log?.info(data, "TenantLogRepository.create");
    await this.tenantLogModel.create(data);
  }

  async findByTenantID(id, ctx) {
    ctx.log?.info({tenant_id: id}, "TenantLogRepository.findByTenantID");
    const tenantLogs = await this.tenantLogModel.findAll({
      where: { tenant_id: id },
      order: [['created_at', 'DESC']],
      include: [
        {
          model: this.userModel,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
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
      delete tenantLog.user_id

      return tenantLog
    })
  }
}

module.exports = TenantLogRepository;