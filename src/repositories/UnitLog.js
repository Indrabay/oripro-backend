class UnitLogRepository {
  constructor(unitLogModel, userModel) {
    this.unitLogModel = unitLogModel;
    this.userModel = userModel;
  }

  async create(data, ctx) {
    try {
      ctx.log?.info(data, "UnitLogRepository.create");
      await this.unitLogModel.create(data, {
        transaction: ctx.transaction
      });
    } catch (error) {
      ctx.log?.error(data, "UnitLogRepository.create_error");
      throw new Error(`error when create unit log. with err: ${error.message}`);
    }
  }

  async findByUnitID(id, ctx) {
    ctx.log?.info({unit_id: id}, "UnitLogRepository.findByUnitID");
    const unitLogs = await this.unitLogModel.findAll({
      where: { unit_id: id },
      order: [['created_at', 'DESC']],
      include: [
        {
          model: this.userModel,
          as: 'createdBy',
          attributes: ['id', 'name', 'email']
        },
      ]
    });

    return unitLogs.map(ul => {
      const unitLog = ul.toJSON();
      unitLog.created_by = unitLog.createdBy
      delete unitLog.createdBy
      return unitLog;
    });
  }
}

module.exports = UnitLogRepository;