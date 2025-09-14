const { Asset } = require('../models/Asset');
const AssetAdmin = require('../models/AssetAdmin');

class AssetRepository {
  constructor() { }

  async create({ name, description, asset_type, code, address, area, status, longitude, latitude, createdBy }, ctx = {}) {
    ctx.log?.info({ name }, 'repo_assets_create');
    const asset = await Asset.create({
      name,
      description,
      asset_type,
      code,
      address,
      area,
      status,
      longitude,
      latitude,
      created_by: createdBy
    });
    return asset.toJSON();
  }

  async assignAdmin(assetId, userId, ctx = {}) {
    ctx.log?.debug({ assetId, userId }, 'repo_assets_assign_admin');
    await AssetAdmin.findOrCreate({
      where: { asset_id: assetId, user_id: userId }
    });
  }

  async isAdminAssigned(assetId, userId, ctx = {}) {
    ctx.log?.debug({ assetId, userId }, 'repo_assets_is_admin_assigned');
    const admin = await AssetAdmin.findOne({ where: { asset_id: assetId, user_id: userId } });
    return !!admin;
  }

  async findById(id, ctx = {}) {
    ctx.log?.debug({ id }, 'repo_assets_find_by_id');
    const asset = await Asset.findByPk(id);
    return asset ? asset.toJSON() : null;
  }

  async listAll(ctx = {}) {
    ctx.log?.debug({}, 'repo_assets_list_all');
    const assets = await Asset.findAll({ order: [['created_at', 'DESC']] });
    return assets.map(a => a.toJSON());
  }

  async listForAdmin(userId, ctx = {}) {
    ctx.log?.debug({ userId }, 'repo_assets_list_for_admin');
    const assetAdmins = await AssetAdmin.findAll({ where: { user_id: userId } });
    const assetIds = assetAdmins.map(aa => aa.asset_id);
    const assets = await Asset.findAll({ where: { id: assetIds }, order: [['created_at', 'DESC']] });
    return assets.map(a => a.toJSON());
  }

  async update(id, { name, description, longitude, latitude, updatedBy }, ctx = {}) {
    ctx.log?.info({ id }, 'repo_assets_update');
    const asset = await Asset.findByPk(id);
    if (!asset) return null;
    await asset.update({
      name: name ?? asset.name,
      description: description ?? asset.description,
      longitude: longitude ?? asset.longitude,
      latitude: latitude ?? asset.latitude,
      updated_by: updatedBy ?? asset.updated_by,
      updated_at: new Date()
    });
    return asset.toJSON();
  }

  async delete(id, ctx = {}) {
    ctx.log?.info({ id }, 'repo_assets_delete');
    await AssetAdmin.destroy({ where: { asset_id: id } });
    const deleted = await Asset.destroy({ where: { id } });
    return deleted > 0;
  }
}

module.exports = { AssetRepository };


