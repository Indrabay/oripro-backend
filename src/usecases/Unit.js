const sequelize = require("../models/sequelize");

class UnitUsecase {
  constructor(unitRepository, unitAttachmentRepository) {
    this.unitRepository = unitRepository;
    this.unitAttachmentRepository = unitAttachmentRepository;
  }

  async createUnit(data, ctx) {
    ctx.log?.info({ data }, "UnitUsecase.create");
    // Business logic for creating a unit
    const result = await sequelize.transaction(async (t) => {
      const unit = await this.unitRepository.create(data, ctx, t);
      if (unit && data.photos) {
        for (let i = 0; i < data.photos.length; i++) {
          let createAttachmentData = {
            unit_id: unit.id,
            url: data.photos[i],
          };

          await this.unitAttachmentRepository.create(createAttachmentData, ctx, t);
        }
      }

      return unit;
    });

    return result;
  }

  async getAllUnits(ctx) {
    // Business logic for retrieving all units
    return this.unitRepository.findAll();
  }

  async getUnitById(id, ctx) {
    // Business logic for retrieving a unit by ID
    const unit = await this.unitRepository.findById(id);
    if (!unit) {
      throw new Error("Unit not found");
    }

    const attachments = await this.unitAttachmentRepository.getByUnitID(unit.id)
    let photos = []
    if (attachments.length > 0) {
      for (let i = 0; i < attachments.length; i++) {
        photos.push(attachments[i].url)
      }
    }
    unit.photos = photos;
    return unit;
  }

  async updateUnit(id, data, ctx) {
    // Business logic for updating a unit
    const unit = await this.unitRepository.findById(id);
    if (!unit) {
      throw new Error("Unit not found");
    }
    return this.unitRepository.update(id, data);
  }
<<<<<<< HEAD

  async deleteUnit(id, ctx) {
    // Business logic for deleting a unit
    const unit = await this.unitRepository.findById(id);
    if (!unit) {
      throw new Error('Unit not found');
    }
    return this.unitRepository.delete(id);
  }
=======
>>>>>>> 54f7e8b8006834d18dd03baa66b9403201712e25
}

module.exports = UnitUsecase;
