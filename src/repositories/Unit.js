class UnitRepository {
  constructor(unitModel, assetModel, userModel) {
    this.assetModel = assetModel;
    this.userModel = userModel;
    this.unitModel = unitModel
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
    const unit = await this.unitModel.create({
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
      created_by: ctx.userId
    }, { transaction: tx });

    return unit.toJSON();
  }

  async findById(id) {
    const unit = await this.unitModel.findByPk(id, {
      include: [
        {
          model: this.assetModel,
          as: 'asset',
          attributes: ['id', 'name'],
        },
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
    const result = unit ? unit.toJSON() : null;
    result.created_by = result.createdBy;
    result.updated_by = result.updatedBy;
    result.asset = result.asset;
    delete result.createdBy;
    delete result.updatedBy;
    delete result.asset_id;
    return result;
  }

  async findAll(filter = {}) {
    const data = await this.unitModel.findAndCountAll({
      where: filter,
      include: [
        {
          model: this.assetModel,
          as: 'asset',
          attributes: ['id', 'name'],
        },
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