const sequelize = require("../models/sequelize");
const { AttachmentType } = require("../models/AssetAttachment");

class AssetUsecase {
  constructor(assetRepository, assetLogRepository, assetAttachmentRepository) {
    this.assetRepository = assetRepository;
    this.assetLogRepository = assetLogRepository;
    this.assetAttachmentRepository = assetAttachmentRepository;
  }
  async createAsset(data, ctx) {
    try {
      const result = await sequelize.transaction(async (t) => {
        const createAssetData = {
          name: data.name,
          code: data.code,
          description: data.description,
          asset_type: data.asset_type,
          status: data.status,
          is_deleted: data.is_deleted,
          address: data.address,
          area: data.area,
          latitude: data.latitude,
          longitude: data.longitude,
          created_by: data.createdBy,
        };
        const asset = await this.assetRepository.create(
          createAssetData,
          ctx,
          t
        );
        if (asset) {
          if (ctx.roleName === "admin") {
            await this.assetRepository.assignAdmin(
              asset.id,
              ctx.userID,
              ctx,
              t
            );
          }
          if (data.sketch) {
            await this.createAttachment(asset.id, [data.sketch], "sketch", t);
          }
          if (data.photos) {
            await this.createAttachment(asset.id, data.photos, "photo", t);
          }
          await this.assetLogRepository.create(asset, ctx, t);
        }

        return asset;
      });

      return result;
    } catch (error) {
      ctx.log?.error(
        { name: data.name, error: error.message },
        "AssetUsecase.error"
      );
      throw new Error(error.message);
    }
  }

  async createAttachment(assetId, data, type, trx) {
    for (let i = 0; i < data.length; i++) {
      const attachmentData = {
        asset_id: assetId,
        url: data[i],
        attachment_type: AttachmentType[type],
      };

      await this.assetAttachmentRepository.create(attachmentData, trx);
    }
  }

  async listAssets(queryParams, ctx) {
    if (ctx.roleName === "super_admin") {
      return await this.assetRepository.listAll(queryParams, ctx);
    }
    return await this.assetRepository.listForAdmin(ctx.userId, queryParams, ctx);
  }

  async getAsset(id, ctx) {
    const asset = await this.assetRepository.findById(id, ctx);
    if (!asset) return null;
    if (ctx.roleName !== "super_admin") {
      const ok = await this.assetRepository.isAdminAssigned(
        asset.id,
        ctx.userId,
        ctx
      );
      if (!ok) return "forbidden";
    }
    const attachments = await this.assetAttachmentRepository.getByAssetID(
      asset.id
    );
    if (attachments.length < 1) {
      return asset;
    }
    let sketchs = [];
    let photos = [];
    for (let i = 0; i < attachments.length; i++) {
      switch (attachments[i].attachment_type) {
        case AttachmentType["photo"]:
          photos.push(attachments[i].url);
          break;
        case AttachmentType["sketch"]:
          sketchs.push(attachments[i].url);
          break;
        default:
          break;
      }
    }

    asset.photos = photos;
    asset.sketch = sketchs;
    return asset;
  }

  async updateAsset(id, data, ctx) {
    let asset = await this.assetRepository.findById(id, ctx);
    if (!asset) return null;
    if (ctx.roleName !== "super_admin") {
      const ok = await this.assetRepository.isAdminAssigned(
        asset.id,
        ctx.userId,
        ctx
      );
      if (!ok) return "forbidden";
    }
    asset = await this.assetRepository.update(
      asset.id,
      { ...data, updatedBy: ctx.userId },
      ctx
    );

    await this.assetLogRepository.create(asset, ctx);

    return asset;
  }

  async deleteAsset(id, ctx) {
    const asset = await this.assetRepository.findById(id, ctx);
    if (!asset) return null;
    if (ctx.roleName !== "super_admin") {
      const ok = await this.assetRepository.isAdminAssigned(
        asset.id,
        ctx.userId,
        ctx
      );
      if (!ok) return "forbidden";
    }
    await this.assetRepository.delete(asset.id, ctx);
    return true;
  }
}

module.exports = AssetUsecase;
