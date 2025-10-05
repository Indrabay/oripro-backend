class UnitLogRepository {
  constructor(unitLogModel, assetModel, userModel) {
    this.unitLogModel = unitLogModel;
    this.userModel = userModel;
    this.assetModel = assetModel;
  }

  async create(data, ctx) {
    ctx.log?.info({}, "UnitLogRepository.create");
    return await this.unitLogModel.create(data)
  }

  async findByUnitID(id, ctx) {
    ctx.log?.info({unit_id: id}, "UnitLogRepository.findByUnitID");
    const unitLog = await this.unitLogModel.findAll({
      where: { unit_id: id },
      order: [['created_at', 'DESC']],
      include: [
        {
          model: this.assetModel,
          as: 'asset',
          attributes: ['id', 'name']
        },
        {
          model: this.userModel,
          as: 'createdBy',
          attributes: ['id', 'name', 'email']
        },
      ]
    });

    return unitLog.map(ul => {
      let unitLog = ul.toJSON();
      unitLog.created_by = unitLog.createdBy
      delete unitLog.createdBy
      delete unitLog.asset_id
      return unitLog;
    });
  }
}

module.exports = UnitLogRepository;