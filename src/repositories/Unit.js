const Unit = require('../models/Unit');

class UnitRepository {
  constructor() {}

  async create(unitData) {
    return await Unit.create(unitData);
  }

  async findById(id) {
    return await Unit.findByPk(id);
  }

  async findAll(filter = {}) {
    return await Unit.findAll({ where: filter });
  }

  async update(id, updateData) {
    const unit = await this.findById(id);
    if (!unit) return null;
    return await unit.update(updateData);
  }

  async delete(id) {
    const unit = await this.findById(id);
    if (!unit) return null;
    await unit.destroy();
    return unit;
  }
}

module.exports = UnitRepository;