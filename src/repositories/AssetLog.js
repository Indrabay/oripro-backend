class AssetLogRepository {
  constructor(assetLogModel) {
    this.assetLogModel = assetLogModel;
  }

  async create({ id, name, description, asset_type, code, address, area, status, longitude, latitude, is_deleted }, ctx = {}) {
    ctx.log?.info({id, is_deleted}, 'repo_asset_log_create');
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
    });
  }
}

module.exports = AssetLogRepository;
