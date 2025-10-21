class ScanInfoRepository {
  constructor(scanInfoModel, userModel) {
    this.scanInfoModel = scanInfoModel;
    this.userModel = userModel;
  }

  async create(data, ctx = {}, tx = null) {
    try {
      ctx.log?.info(data, 'ScanInfoRepository.create');
      const scanInfo = await this.scanInfoModel.create({
        scan_code: data.scan_code,
        latitude: data.latitude,
        longitude: data.longitude,
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
      const { page = 1, limit = 10 } = queryParams;
      const offset = (page - 1) * limit;

      const { rows, count } = await this.scanInfoModel.findAndCountAll({
        limit: parseInt(limit),
        offset: parseInt(offset),
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
          }
        ]
      });

      return {
        scanInfos: rows.map(si => si.toJSON()),
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
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

