class UnitRepository {
  constructor(unitModel) {
    this.unitModel = unitModel
  }

  async create(unitData, ctx) {
    ctx.log?.info({name: unitData.name}, "UnitRepository.create");
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
    return await this.unitModel.create({
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
    });
  }

  async findById(id) {
    return await this.unitModel.findByPk(id);
  }

  async findAll(filter = {}) {
    return await this.unitModel.findAll({ where: filter });
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