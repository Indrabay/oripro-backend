class UnitUseCases {
  constructor(unitRepository) {
    this.unitRepository = unitRepository;
  }

  async createUnit(data) {
    // Business logic for creating a unit
    if (!data.name || !data.symbol) {
      throw new Error('Name and symbol are required');
    }
    return this.unitRepository.create(data);
  }

  async getAllUnits() {
    // Business logic for retrieving all units
    return this.unitRepository.findAll();
  }

  async getUnitById(id) {
    // Business logic for retrieving a unit by ID
    const unit = await this.unitRepository.findById(id);
    if (!unit) {
      throw new Error('Unit not found');
    }
    return unit;
  }

  async updateUnit(id, data) {
    // Business logic for updating a unit
    const unit = await this.unitRepository.findById(id);
    if (!unit) {
      throw new Error('Unit not found');
    }
    return this.unitRepository.update(id, data);
  }

  async deleteUnit(id) {
    // Business logic for deleting a unit
    const unit = await this.unitRepository.findById(id);
    if (!unit) {
      throw new Error('Unit not found');
    }
    return this.unitRepository.delete(id);
  }
}

module.exports = UnitUseCases;