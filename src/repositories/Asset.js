const { Op } = require("sequelize");

class AssetRepository {
  constructor(assetModel, assetAdminModel, userModel) {
    this.assetModel = assetModel;
    this.assetAdminModel = assetAdminModel;
    this.userModel = userModel;
  }

  async create(
    {
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
      created_by,
    },
    ctx = {},
    t = null
  ) {
    try {
      ctx.log?.info({ name }, "AssetRepository.Success create");
      const asset = await this.assetModel.create(
        {
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
          created_by,
        },
        { transaction: t }
      );
      return asset.toJSON();
    } catch (error) {
      ctx.log?.error({ name }, `AssetRepository.Error create: ${error}`);
      throw new Error(`error when create asset`);
    }
  }

  async assignAdmin(assetId, userId, ctx = {}, t = null) {
    ctx.log?.debug({ assetId, userId }, "repo_assets_assign_admin");
    await this.assetAdminModel.findOrCreate(
      {
        where: { asset_id: assetId, user_id: userId },
      },
      { transaction: t }
    );
  }

  async isAdminAssigned(assetId, userId, ctx = {}) {
    ctx.log?.debug({ assetId, userId }, "repo_assets_is_admin_assigned");
    const admin = await this.assetAdminModel.findOne({
      where: { asset_id: assetId, user_id: userId },
    });
    return !!admin;
  }

  async findById(id, ctx = {}) {
    ctx.log?.debug({ id }, "repo_assets_find_by_id");
    const asset = await this.assetModel.findByPk(id, {
      include: [
        {
          model: this.userModel,
          as: 'createdBy',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: this.userModel,
          as: 'updatedBy',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    const result = asset ? asset.toJSON() : null;
    result.created_by = result.createdBy;
    result.updated_by = result.updatedBy;
    delete result.createdBy;
    delete result.updatedBy;
    return result;
  }

  async listAll(queryParams, ctx = {}) {
    ctx.log?.debug({}, "repo_assets_list_all");
    let whereQuery = {};
    whereQuery.where = {
      is_deleted: false
    };
    if (queryParams.name) {
      whereQuery.where.name = {
        [Op.iLike]: `%${queryParams.name}%`,
      };
    }

    if (queryParams.asset_type) {
      whereQuery.where.asset_type = queryParams.asset_type
    }
    if (queryParams.limit) {
      whereQuery.limit = parseInt(queryParams.limit);
    }

    if (queryParams.offset) {
      whereQuery.offset = parseInt(queryParams.offset);
    }

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
          order = [["name", "ASC"]];
          break;
        case "z-a":
          order = [["name", "DESC"]];
        default:
          break;
      }

      whereQuery.order = order;
    }

    whereQuery.include = [
      {
        model: this.userModel,
        as: 'createdBy',
        attributes: ['id', 'name', 'email'],
      },
      {
        model: this.userModel,
        as: 'updatedBy',
        attributes: ['id', 'name', 'email'],
      },
    ]

    const assets = await this.assetModel.findAndCountAll(whereQuery
    );
    return {
      assets: assets.rows.map((a) => {
        const { createdBy, updatedBy, ...asset } = a.toJSON();
        asset.created_by = createdBy;
        asset.updated_by = updatedBy;
        return asset;
      }),
      total: assets.count,
    };
  }

  async listForAdmin(userId, queryParams = {}, ctx = {}) {
    ctx.log?.debug({ userId }, "repo_assets_list_for_admin");
    const assetAdmins = await this.assetAdminModel.findAll({
      where: { user_id: userId },
    });
    const assetIds = assetAdmins.map((aa) => aa.asset_id);
    const assets = await this.assetModel.findAll({
      where: { id: assetIds },
      order: [["created_at", "DESC"]],
    });
    return assets.map((a) => a.toJSON());
  }

  async update(
    id,
    { name, description, asset_type, address, area, status, longitude, latitude, updatedBy },
    ctx = {}
  ) {
    ctx.log?.info({ id }, "repo_assets_update");
    const asset = await this.assetModel.findByPk(id);
    if (!asset) return null;
    await asset.update({
      name: name ?? asset.name,
      description: description ?? asset.description,
      asset_type: asset_type ?? asset.asset_type,
      address: address ?? asset.address,
      area: area ?? asset.area,
      status: status ?? asset.status,
      longitude: longitude ?? asset.longitude,
      latitude: latitude ?? asset.latitude,
      updated_by: updatedBy ?? asset.updated_by,
      updated_at: new Date(),
    });
    return asset.toJSON();
  }

  async delete(id, ctx = {}) {
    ctx.log?.info({ id }, "repo_assets_delete");
    const asset = await this.assetModel.findByPk(id);
    if (!asset) return null;
    await asset.destroy();
    return asset.toJSON();
  }
}

module.exports = AssetRepository;
