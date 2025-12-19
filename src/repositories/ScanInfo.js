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
      const { Op } = require('sequelize');
      
      // Build where clause for filtering
      const whereClause = {};
      
      if (queryParams.asset_id) {
        whereClause.asset_id = queryParams.asset_id;
      }
      if (queryParams.scan_code) {
        whereClause.scan_code = {
          [Op.iLike]: `%${queryParams.scan_code}%`
        };
      }
      if (queryParams.user_id || queryParams.created_by) {
        // Support both user_id and created_by for consistency
        whereClause.created_by = queryParams.user_id || queryParams.created_by;
      }
      
      // Date range filtering
      if (queryParams.start_date || queryParams.end_date) {
        whereClause.created_at = {};
        if (queryParams.start_date) {
          // Start of day for start_date
          whereClause.created_at[Op.gte] = new Date(queryParams.start_date + 'T00:00:00.000Z');
        }
        if (queryParams.end_date) {
          // End of day for end_date
          whereClause.created_at[Op.lte] = new Date(queryParams.end_date + 'T23:59:59.999Z');
        }
      }

      const whereQuery = {
        where: whereClause
      };

      // Handle pagination
      if (queryParams.limit) {
        whereQuery.limit = parseInt(queryParams.limit);
      }
      if (queryParams.offset) {
        whereQuery.offset = parseInt(queryParams.offset);
      }

      // Handle ordering - sama seperti asset (menggunakan updated_at untuk newest/oldest)
      let order;
      if (queryParams.order) {
        switch (queryParams.order) {
          case "oldest":
            order = [["updated_at", "ASC"]];
            break;
          case "newest":
            order = [["updated_at", "DESC"]];
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
            order = [["updated_at", "DESC"]];
            break;
        }
        whereQuery.order = order;
      } else {
        whereQuery.order = [["updated_at", "DESC"]];
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

      // Calculate pagination metadata
      const limit = queryParams.limit ? parseInt(queryParams.limit) : null;
      const offset = queryParams.offset ? parseInt(queryParams.offset) : 0;
      const totalPages = limit ? Math.ceil(count / limit) : 1;
      const currentPage = limit ? Math.floor(offset / limit) + 1 : 1;

      return {
        scanInfos: rows.map(si => si.toJSON()),
        total: count,
        limit: limit,
        offset: offset,
        totalPages: totalPages,
        currentPage: currentPage
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

