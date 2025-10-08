const sequelize = require("../models/sequelize");

class UnitUsecase {
  constructor(unitRepository, unitAttachmentRepository, unitLogRepository) {
    this.unitRepository = unitRepository;
    this.unitAttachmentRepository = unitAttachmentRepository;
    this.unitLogRepository = unitLogRepository;
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

          await this.unitAttachmentRepository.create(
            createAttachmentData,
            ctx,
            t
          );
        }
      }

      const unitLog = {
        unit_id: unit.id,
        asset_id: unit.asset_id,
        name: unit.name,
        size: unit.size,
        rent_price: unit.rent_price,
        lamp: unit.lamp,
        electric_socket: unit.electric_socket,
        electrical_power: unit.electrical_power,
        electrical_unit: unit.electrical_unit,
        is_toilet_exist: unit.is_toilet_exist,
        description: unit.description,
        is_deleted: unit.is_deleted,
        created_by: ctx.userId,
      };
      await this.unitLogRepository.create(unitLog, ctx);

      return unit;
    });

    return result;
  }

  async getAllUnits(filters, ctx) {
    // Business logic for retrieving all units
    return this.unitRepository.findAll(filters, ctx);
  }

  async getUnitById(id, ctx) {
    // Business logic for retrieving a unit by ID
    const unit = await this.unitRepository.findById(id);
    if (!unit) {
      throw new Error("Unit not found");
    }

    const attachments = await this.unitAttachmentRepository.getByUnitID(
      unit.id
    );
    let photos = [];
    if (attachments.length > 0) {
      for (let i = 0; i < attachments.length; i++) {
        photos.push(attachments[i].url);
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
    const updatedData = {
      asset_id: data.asset_id ?? unit.asset?.id,
      name: data.name ?? unit.name,
      size: data.size ?? unit.size,
      rent_price: data.rent_price ?? unit.rent_price,
      lamp: data.lamp ?? unit.lamp,
      electric_socket: data.electric_socket ?? unit.electric_socket,
      electrical_power: data.electrical_power ?? unit.electrical_power,
      electrical_unit: data.electrical_unit ?? unit.electrical_unit,
      is_toilet_exist: data.is_toilet_exist ?? unit.is_toilet_exist,
      description: data.description ?? unit.description,
      is_deleted: data.is_deleted ?? unit.is_deleted,
      updated_by: ctx.userId
    };
    const updatedUnit = await this.unitRepository.update(id, updatedData);
    if (updatedUnit) {
      console.log('aman update unit')
      const unitLog = {
        unit_id: updatedUnit.id,
        asset_id: data.asset_id ?? unit.asset?.id,
        name: updatedUnit.name,
        size: updatedUnit.size,
        rent_price: updatedUnit.rent_price,
        lamp: updatedUnit.lamp,
        electric_socket: updatedUnit.electric_socket,
        electrical_power: updatedUnit.electrical_power,
        electrical_unit: updatedUnit.electrical_unit,
        is_toilet_exist: updatedUnit.is_toilet_exist,
        description: updatedUnit.description,
        is_deleted: updatedUnit.is_deleted,
        created_by: ctx.userId,
      };

      await this.unitLogRepository.create(unitLog, ctx);
    }

    return updatedUnit;
  }

  async deleteUnit(id, ctx) {
    // Business logic for deleting a unit
    const unit = await this.unitRepository.findById(id);
    if (!unit) {
      throw new Error("Unit not found");
    }
    return this.unitRepository.delete(id);
  }

  async getUnitLogs(id, ctx) {
    const unitLogs = await this.unitLogRepository.findByUnitID(id, ctx);

    return unitLogs;
  }
}

module.exports = UnitUsecase;
