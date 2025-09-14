class AssetUsecase {
  constructor(assetRepository) {
    this.assetRepository = assetRepository;
  }
  async createAsset(data, ctx) {
    const asset = await this.assetRepository.create(data, ctx);
    if (ctx.roleName === 'admin') {
      await this.assetRepository.assignAdmin(asset.id, data.ownerId, ctx);
    }
    return asset;
  }

  async listAssets(ctx) {
    if (ctx.roleName === 'super_admin') {
      return await this.assetRepository.listAll(ctx);
    }
    return await this.assetRepository.listForAdmin(ctx.userId, ctx);
  }

  async getAsset(id, ctx) {
    const asset = await this.assetRepository.findById(id, ctx);
    if (!asset) return null;
    if (ctx.roleName !== 'super_admin') {
      const ok = await this.assetRepository.isAdminAssigned(asset.id, ctx.userId, ctx);
      if (!ok) return 'forbidden';
    }
    return asset;
  }

  async updateAsset(id, data, ctx) {
    const asset = await this.assetRepository.findById(id, ctx);
    if (!asset) return null;
    if (ctx.roleName !== 'super_admin') {
      const ok = await this.assetRepository.isAdminAssigned(asset.id, ctx.userId, ctx);
      if (!ok) return 'forbidden';
    }
    return await this.assetRepository.update(asset.id, { ...data, updatedBy: ctx.userId }, ctx);
  }

  async deleteAsset(id, ctx) {
    const asset = await this.assetRepository.findById(id, ctx);
    if (!asset) return null;
    if (ctx.roleName !== 'super_admin') {
      const ok = await this.assetRepository.isAdminAssigned(asset.id, ctx.userId, ctx);
      if (!ok) return 'forbidden';
    }
    await this.assetRepository.delete(asset.id, ctx);
    return true;
  }
}

module.exports = AssetUsecase;
