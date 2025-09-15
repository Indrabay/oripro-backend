class UnitRepository {
  constructor(unitModel) {
    this.unitModel = unitModel
  }

  async create(unitData) {
    return await this.unitModel.create(unitData);
  }

  async findById(id) {
    return await this.unitModel.findByPk(id);
  }

  async findAll(filter = {}) {
    return await this.unitModel.findAll({ where: filter });
  }

  async update(id, updateData) {
    const unit = await this.unitModel.findById(id);
    if (!unit) return null;
    return await unit.update(updateData);
  }

  async delete(id) {
    const unit = await this.unitModel.findById(id);
    if (!unit) return null;
    await unit.destroy();
    return unit;
  }
}

module.exports = UnitRepository;