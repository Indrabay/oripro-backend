const sequelize = require("../models/sequelize");
const { AttachmentType } = require("../models/AssetAttachment");
const moment = require("moment");
const PrefixAsset = "ASSET";

const { AssetStatusIntToStr, AssetTypeIntToStr } = require('../models/Asset');

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
          description: data.description,
          asset_type: data.asset_type,
          status: data.status,
          code: data.code || this.generateCode(),
          is_deleted: data.is_deleted,
          address: data.address,
          area: data.area,
          latitude: data.latitude,
          longitude: data.longitude,
          created_by: ctx.userID,
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

        asset.asset_type = AssetTypeIntToStr[asset.asset_type];
        asset.status = AssetStatusIntToStr[asset.status];

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

  generateCode() {
    return `${PrefixAsset}-${moment().local().format('DDMMYYYYHHmmss')}`
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
      const data = await this.assetRepository.listAll(queryParams, ctx);
      data.assets.map(a => {
        a.asset_type = AssetTypeIntToStr[a.asset_type];
        a.status = AssetStatusIntToStr[a.status];
        return a
      })
      return data

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
    asset.asset_type = AssetTypeIntToStr[asset.asset_type];
        asset.status = AssetStatusIntToStr[asset.status];
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

  async getAssetLogs(id, ctx) {
    const assetLogs = await this.assetLogRepository.getByAssetID(id, ctx)

    return assetLogs.map(al => {
      al.asset_type = AssetTypeIntToStr[al.asset_type];
        al.status = AssetStatusIntToStr[al.status];

        return al
    })
  }
}

module.exports = AssetUsecase;
