const sequelize = require("../models/sequelize");
const { AttachmentType } = require("../models/AssetAttachment");
const moment = require("moment");
const PrefixAsset = "ASSET";

const { AssetStatusIntToStr, AssetTypeIntToStr } = require('../models/Asset');
const { transformImageUrls } = require('../services/baseUrl');

class AssetUsecase {
  constructor(assetRepository, assetLogRepository, assetAttachmentRepository, unitRepository) {
    this.assetRepository = assetRepository;
    this.assetLogRepository = assetLogRepository;
    this.assetAttachmentRepository = assetAttachmentRepository;
    this.unitRepository = unitRepository;
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
          // Create log entry - only store essential data
          const assetLog = {
            asset_id: asset.id,
            action: 'CREATE',
            old_data: null,
            new_data: {
              name: asset.name,
              code: asset.code,
              status: AssetStatusIntToStr[asset.status],
              asset_type: AssetTypeIntToStr[asset.asset_type],
            },
            created_by: ctx.userID,
          };

          await this.assetLogRepository.create(assetLog, { ...ctx, transaction: t });
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
    const data = await this.assetRepository.listAll(queryParams, ctx);
    data.assets.map(a => {
      a.asset_type = AssetTypeIntToStr[a.asset_type];
      a.status = AssetStatusIntToStr[a.status];
      return a
    })
    
    // Get unit counts per asset
    const assetIds = data.assets.map(a => a.id);
    const unitCountMap = await this.unitRepository.countByAssetIds(assetIds, ctx);
    
    // Add total_units to each asset
    data.assets.forEach(asset => {
      asset.total_units = unitCountMap[asset.id] || 0;
    });
    
    return data

    
  }

  async getAsset(id, ctx) {
    const asset = await this.assetRepository.findById(id, ctx);
    if (!asset) return null;
    
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

    asset.photos = transformImageUrls(photos);
    asset.sketch = transformImageUrls(sketchs);
    asset.asset_type = AssetTypeIntToStr[asset.asset_type];
        asset.status = AssetStatusIntToStr[asset.status];
    return asset;
  }

  async updateAsset(id, data, ctx) {
    let asset = await this.assetRepository.findById(id, ctx);
    if (!asset) return null;
    
    asset = await this.assetRepository.update(
      asset.id,
      { ...data, updatedBy: ctx.userId },
      ctx
    );

    // Create log entry - only store changed data
    const oldData = {};
    const newData = {};
    
    // Check which fields actually changed
    if (data.name !== undefined && data.name !== asset.name) {
      oldData.name = asset.name;
      newData.name = data.name;
    }
    if (data.description !== undefined && data.description !== asset.description) {
      oldData.description = asset.description;
      newData.description = data.description;
    }
    if (data.address !== undefined && data.address !== asset.address) {
      oldData.address = asset.address;
      newData.address = data.address;
    }
    if (data.area !== undefined && data.area !== asset.area) {
      oldData.area = asset.area;
      newData.area = data.area;
    }
    if (data.asset_type !== undefined && data.asset_type !== asset.asset_type) {
      oldData.asset_type = AssetTypeIntToStr[asset.asset_type];
      newData.asset_type = AssetTypeIntToStr[data.asset_type];
    }
    if (data.status !== undefined && data.status !== asset.status) {
      oldData.status = AssetStatusIntToStr[asset.status];
      newData.status = AssetStatusIntToStr[data.status];
    }
    if (data.longitude !== undefined && data.longitude !== asset.longitude) {
      oldData.longitude = asset.longitude;
      newData.longitude = data.longitude;
    }
    if (data.latitude !== undefined && data.latitude !== asset.latitude) {
      oldData.latitude = asset.latitude;
      newData.latitude = data.latitude;
    }

    // Only create log if there are actual changes
    if (Object.keys(oldData).length > 0) {
      const assetLog = {
        asset_id: asset.id,
        action: 'UPDATE',
        old_data: oldData,
        new_data: newData,
        created_by: ctx.userID,
      };

      await this.assetLogRepository.create(assetLog, ctx);
    }

    return asset;
  }

  async deleteAsset(id, ctx) {
    const asset = await this.assetRepository.findById(id, ctx);
    if (!asset) return null;
    
    // Create log entry before deletion
    const assetLog = {
      asset_id: asset.id,
      action: 'DELETE',
      old_data: {
        name: asset.name,
        code: asset.code,
        status: AssetStatusIntToStr[asset.status],
        asset_type: AssetTypeIntToStr[asset.asset_type],
      },
      new_data: null,
      created_by: ctx.userID,
    };

    await this.assetLogRepository.create(assetLog, ctx);

    return await this.assetRepository.delete(asset.id, ctx);
  }

  async getAssetLogs(id, ctx) {
    ctx.log?.info({ asset_id: id }, "AssetUsecase.getAssetLogs");
    const assetLogs = await this.assetLogRepository.findByAssetID(id, ctx);
    return assetLogs;
  }
}

module.exports = AssetUsecase;
