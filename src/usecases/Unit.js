class UnitUsecase {
  constructor(unitRepository) {
    this.unitRepository = unitRepository;
  }

  async createUnit(data, ctx) {
    ctx.log?.info({ data }, 'UnitUsecase.create');
    // Business logic for creating a unit
    return this.unitRepository.create(data, ctx);
  }

  async getAllUnits(ctx) {
    // Business logic for retrieving all units
    return this.unitRepository.findAll();
  }

  async getUnitById(id, ctx) {
    // Business logic for retrieving a unit by ID
    const unit = await this.unitRepository.findById(id);
    if (!unit) {
      throw new Error('Unit not found');
    }
    return unit;
  }

  async updateUnit(id, data, ctx) {
    // Business logic for updating a unit
    const unit = await this.unitRepository.findById(id);
    if (!unit) {
      throw new Error('Unit not found');
    }
    return this.unitRepository.update(id, data);
  }

  async deleteUnit(id, ctx) {
    // Business logic for deleting a unit
    const unit = await this.unitRepository.findById(id);
    if (!unit) {
      throw new Error('Unit not found');
    }
    return this.unitRepository.delete(id);
  }
}

module.exports = UnitUsecase;