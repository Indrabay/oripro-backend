const { Op } = require("sequelize");

class ScanInfoRepository {
  constructor(scanInfoModel, userModel, assetModel) {
    this.scanInfoModel = scanInfoModel;
    this.userModel = userModel;
    this.assetModel = assetModel;
  }

  async create(data, ctx = {}, tx = null) {
    try {
      ctx.log?.info(data, 'ScanInfoRepository.create');
      const scanInfo = await this.scanInfoModel.create({
        scan_code: data.scan_code,
        latitude: data.latitude,
        longitude: data.longitude,
        asset_id: data.asset_id,
        created_by: ctx.userId,
      }, { transaction: tx });
      return scanInfo.toJSON();
    } catch (error) {
      ctx.log?.error({ data, error }, 'ScanInfoRepository.create_error');
      throw error;
    }
  }

  async findById(id, ctx = {}) {
    try {
      ctx.log?.info({ id }, 'ScanInfoRepository.findById');
      const scanInfo = await this.scanInfoModel.findByPk(id, {
        include: [
          {
            model: this.userModel,
            as: 'createdBy',
            attributes: ['id', 'name', 'email']
          },
          {
            model: this.userModel,
            as: 'updatedBy',
            attributes: ['id', 'name', 'email']
          },
          {
            model: this.assetModel,
            as: 'asset',
            attributes: ['id', 'name', 'code', 'asset_type', 'status']
          }
        ]
      });
      return scanInfo;
    } catch (error) {
      ctx.log?.error({ id, error }, 'ScanInfoRepository.findById_error');
      throw error;
    }
  }

  async findByScanCode(scanCode, ctx = {}) {
    try {
      ctx.log?.info({ scanCode }, 'ScanInfoRepository.findByScanCode');
      const scanInfos = await this.scanInfoModel.findAll({
        where: { scan_code: scanCode },
        order: [['created_at', 'DESC']],
        include: [
          {
            model: this.userModel,
            as: 'createdBy',
            attributes: ['id', 'name', 'email']
          },
          {
            model: this.userModel,
            as: 'updatedBy',
            attributes: ['id', 'name', 'email']
          },
          {
            model: this.assetModel,
            as: 'asset',
            attributes: ['id', 'name', 'code', 'asset_type', 'status']
          }
        ]
      });
      return scanInfos.map(si => si.toJSON());
    } catch (error) {
      ctx.log?.error({ scanCode, error }, 'ScanInfoRepository.findByScanCode_error');
      throw error;
    }
  }

  async listAll(queryParams = {}, ctx = {}) {
    try {
      ctx.log?.info(queryParams, 'ScanInfoRepository.listAll');
      let whereQuery = {};
      
      // Build where clause for filtering
      if (queryParams.asset_id || queryParams.scan_code) {
        whereQuery.where = {};
        if (queryParams.asset_id) {
          whereQuery.where.asset_id = queryParams.asset_id;
        }
        if (queryParams.scan_code) {
          whereQuery.where.scan_code = queryParams.scan_code;
        }
      }

      // Handle pagination
      if (queryParams.limit) {
        whereQuery.limit = parseInt(queryParams.limit);
      }
      if (queryParams.offset) {
        whereQuery.offset = parseInt(queryParams.offset);
      }

      // Handle ordering
      let order;
      if (queryParams.order) {
        switch (queryParams.order) {
          case "oldest":
            order = [["created_at", "ASC"]];
            break;
          case "newest":
            order = [["created_at", "DESC"]];
            break;
          case "a-z":
            order = [["scan_code", "ASC"]];
            break;
          case "z-a":
            order = [["scan_code", "DESC"]];
            break;
          case "asset-a-z":
            order = [
              [{ model: this.assetModel, as: 'asset' }, 'name', 'ASC']
            ];
            break;
          case "asset-z-a":
            order = [
              [{ model: this.assetModel, as: 'asset' }, 'name', 'DESC']
            ];
            break;
          case "user-a-z":
            order = [
              [{ model: this.userModel, as: 'createdBy' }, 'name', 'ASC']
            ];
            break;
          case "user-z-a":
            order = [
              [{ model: this.userModel, as: 'createdBy' }, 'name', 'DESC']
            ];
            break;
          default:
            order = [["created_at", "DESC"]];
            break;
        }
        whereQuery.order = order;
      } else {
        whereQuery.order = [["created_at", "DESC"]];
      }

      // Include related models
      whereQuery.include = [
        {
          model: this.userModel,
          as: 'createdBy',
          attributes: ['id', 'name', 'email']
        },
        {
          model: this.userModel,
          as: 'updatedBy',
          attributes: ['id', 'name', 'email']
        },
        {
          model: this.assetModel,
          as: 'asset',
          attributes: ['id', 'name', 'code', 'asset_type', 'status']
        }
      ];

      const { rows, count } = await this.scanInfoModel.findAndCountAll(whereQuery);

      return {
        scanInfos: rows.map(si => si.toJSON()),
        total: count,
      };
    } catch (error) {
      ctx.log?.error({ queryParams, error }, 'ScanInfoRepository.listAll_error');
      throw error;
    }
  }

  async update(id, data, ctx = {}, tx = null) {
    try {
      ctx.log?.info({ id, data }, 'ScanInfoRepository.update');
      const updateData = {
        ...data,
        updated_by: ctx.userId,
        updated_at: new Date(),
      };
      await this.scanInfoModel.update(updateData, {
        where: { id },
        transaction: tx
      });
      const scanInfo = await this.findById(id, ctx);
      return scanInfo;
    } catch (error) {
      ctx.log?.error({ id, data, error }, 'ScanInfoRepository.update_error');
      throw error;
    }
  }

  async delete(id, ctx = {}, tx = null) {
    try {
      ctx.log?.info({ id }, 'ScanInfoRepository.delete');
      await this.scanInfoModel.destroy({
        where: { id },
        transaction: tx
      });
      return true;
    } catch (error) {
      ctx.log?.error({ id, error }, 'ScanInfoRepository.delete_error');
      throw error;
    }
  }
}

module.exports = ScanInfoRepository;

