const { Op } = require("sequelize");

class UnitRepository {
  constructor(unitModel, assetModel, userModel) {
    this.assetModel = assetModel;
    this.userModel = userModel;
    this.unitModel = unitModel;
  }

  async create(unitData, ctx, tx = null) {
    ctx.log?.info({ name: unitData.name }, "UnitRepository.create");
    const {
      name,
      asset_id,
      size,
      rent_price,
      lamp,
      electrical_socket,
      electrical_power,
      electrical_unit,
      is_toilet_exist,
      description,
      is_deleted,
    } = unitData;
    const unit = await this.unitModel.create(
      {
        name,
        asset_id,
        size,
        rent_price,
        lamp,
        electric_socket: electrical_socket,
        electrical_power,
        electrical_unit,
        is_toilet_exist,
        description,
        is_deleted,
        created_by: ctx.userId,
      },
      { transaction: tx }
    );

    return unit.toJSON();
  }

  async findById(id) {
    const unit = await this.unitModel.findByPk(id, {
      include: [
        {
          model: this.assetModel,
          as: "asset",
          attributes: ["id", "name"],
        },
        {
          model: this.userModel,
          as: "createdBy",
          attributes: ["id", "name", "email"],
        },
        {
          model: this.userModel,
          as: "updatedBy",
          attributes: ["id", "name", "email"],
        },
      ],
    });
    const result = unit ? unit.toJSON() : null;
    result.created_by = result.createdBy;
    result.updated_by = result.updatedBy;
    result.asset = result.asset;
    delete result.createdBy;
    delete result.updatedBy;
    delete result.asset_id;
    return result;
  }

  async findAll(filter = {}, ctx) {
    ctx.log?.info({}, "UnitRepository.findAll");
    let whereQuery = {};
    if (filter.asset_id || filter.name || filter.is_toilet_exist) {
      whereQuery.where = {};
      if (filter.asset_id) {
        whereQuery.where.asset_id = filter.asset_id;
      }

      if (filter.name) {
        const nameParam = filter.name.toLowerCase();
        whereQuery.where.name = {
          [Op.like]: `%${nameParam}%`,
        };
      }

      if (filter.is_toilet_exist) {
        whereQuery.where.is_toilet_exist = filter.is_toilet_exist;
      }
    }

    if (filter.limit) {
      whereQuery.limit = parseInt(filter.limit);
    }

    if (filter.offset) {
      whereQuery.offset = parseInt(filter.offset);
    }

    if (filter.order) {
      switch (filter.order) {
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
        model: this.assetModel,
        as: "asset",
        attributes: ["id", "name"],
      },
      {
        model: this.userModel,
        as: "createdBy",
        attributes: ["id", "name", "email"],
      },
      {
        model: this.userModel,
        as: "updatedBy",
        attributes: ["id", "name", "email"],
      },
    ];
    const data = await this.unitModel.findAndCountAll(whereQuery);
    const result = {
      units: data.rows.map((u) => {
        const unit = u.toJSON();
        unit.created_by = u.createdBy;
        unit.updated_by = u.updatedBy;
        unit.asset = u.asset;
        delete unit.asset_id;
        delete unit.createdBy;
        delete unit.updatedBy;

        return unit;
      }),
      total: data.count,
    };
    return result;
  }

  async update(id, updateData) {
    const unit = await this.unitModel.findByPk(id);
    if (!unit) return null;
    return await unit.update(updateData);
  }

  async delete(id) {
    const unit = await this.unitModel.findByPk(id);
    if (!unit) return null;
    await unit.destroy();
    return unit;
  }
}

module.exports = UnitRepository;
