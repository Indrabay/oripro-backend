class AssetLogRepository {
  constructor(assetLogModel, userModel) {
    this.assetLogModel = assetLogModel;
    this.userModel = userModel;
  }

  async create({ id, name, description, asset_type, code, address, area, status, longitude, latitude, is_deleted }, ctx = {}, tx = null) {
    ctx.log?.info({id, is_deleted}, 'AssetLogRepository.create');
    await this.assetLogModel.create({
      asset_id: id,
      name,
      description,
      asset_type,
      code,
      address,
      area,
      status,
      longitude,
      latitude,
      is_deleted,
      created_by: ctx.userID
    }, { transaction: tx});
  }

  async getByAssetID(id, ctx = {}) {
    ctx.log?.info({asset_id: id}, 'AssetLogRepository.getByAssetID');
    const assetLogs = await this.assetLogModel.findAll({
      where: { asset_id: id },
      order: [['created_at', 'DESC']],
      include: [
        {
          model: this.userModel,
          as: 'createdBy',
          attributes: ['id', 'name', 'email']
        },
      ]
    });

    return assetLogs.map(al => {
      const assetLog = al.toJSON()
      assetLog.created_by = assetLog.createdBy
      delete assetLog.createdBy
      return assetLog
    })
  }
}

module.exports = AssetLogRepository;
