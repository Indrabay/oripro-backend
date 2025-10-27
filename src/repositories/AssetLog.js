class AssetLogRepository {
  constructor(assetLogModel, userModel) {
    this.assetLogModel = assetLogModel;
    this.userModel = userModel;
  }

  async create(data, ctx) {
    try {
      ctx.log?.info(data, "AssetLogRepository.create");
      await this.assetLogModel.create(data, {
        transaction: ctx.transaction
      });
    } catch (error) {
      ctx.log?.error(data, "AssetLogRepository.create_error");
      throw new Error(`error when create asset log. with err: ${error.message}`);
    }
  }

  async findByAssetID(id, ctx) {
    ctx.log?.info({asset_id: id}, "AssetLogRepository.findByAssetID");
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
