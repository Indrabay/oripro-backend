const moment = require('moment');
const sequelize = require('../models/sequelize');
const dateFormat = "DD-MM-YYYY HH:mm"
const PrefixTenant = "TENT"
const { DurationUnit, DurationUnitStr } = require('../models/Tenant');
const { AttachmentType } = require('../models/TenantAttachment');


class TenantUseCase {
  constructor(tenantRepository, tenantAttachmentRepository, tenantUnitRepository, tenantCategoryMapRepo) {
    this.tenantRepository = tenantRepository;
    this.tenantAttachmentRepository = tenantAttachmentRepository;
    this.tenantUnitRepository = tenantUnitRepository;
    this.tenantCategoryMapRepo = tenantCategoryMapRepo;
  }

  async createTenant(data) {
    try {
      const result = await sequelize.transaction(async t => {
        const createTenantData = {
          user_id: data.user_id,
          name: data.name,
          contract_begin_at: data.contract_begin_at,
          contract_end_at: this.calculateDueDate(data.contract_begin_at, data.rent_duration, data.rent_duration_unit),
          code: this.generateCode(),
          created_by: data.createdBy,
          rent_duration: data.rent_duration,
          rent_duration_unit: DurationUnit[data.rent_duration_unit],
        }
        const tenant = await this.tenantRepository.create(createTenantData, t);

        if (tenant) {
          await this.saveTenantAttachments(tenant, data.tenant_identifications, "id", t)
          await this.saveTenantAttachments(tenant, data.contract_documents, "contract", t)
          await this.saveCategories(tenant, data.categories, data.createdBy, t)
          await this.saveTenantUnits(tenant, data.unit_ids, t)
        }
        return this.tenantToJson(tenant)
      });

      return result;
    } catch (error) {
      console.log(error)
    }
  }

  async saveTenantUnits(tenant, data, t) {
    for (let i = 0; i < data.length; i++) {
      let dataUnit = {
        tenant_id: tenant.id,
        unit_id: data[i]
      }

      await this.tenantUnitRepository.create(dataUnit, t)
    }
  }

  async saveCategories(tenant, data, createdBy, tx) {
    for (let i = 0; i < data.length; i++) {
      let dataCategories = {
        tenant_id: tenant.id,
        status: 1,
        category_id: data[i],
        created_by: createdBy
      }

      await this.tenantCategoryMapRepo.create(dataCategories, tx)
    }
  }

  async saveTenantAttachments(tenant, data, type, tx) {
    for (let i = 0; i < data.length; i++) {
      let attachmentType = AttachmentType[type]
      let dataAttachment = {
        tenant_id: tenant.id,
        url: data[i],
        status: 1,
        attachment_type: attachmentType
      }

      await this.tenantAttachmentRepository.create(dataAttachment, tx);
    }
  }

  calculateDueDate(beginDate, rent_duration, rent_unit) {
    let endDate = moment(beginDate).tz('Asia/Jakarta')
    if (rent_unit == "year") {
      endDate.add(rent_duration, 'years');
    } else {
      endDate.add(rent_duration, 'months');
    }

    return endDate
  }

  generateCode() {
    return `${PrefixTenant}-${moment().local().format('DDMMYYYYHHmmss')}`
  }

  async getTenantById(id) {
    return this.tenantRepository.findById(id);
  }

  async getAllTenants(filter = {}) {
    return this.tenantRepository.findAll(filter);
  }

  async updateTenant(id, data) {
    return this.tenantRepository.update(id, data);
  }

  async deleteTenant(id) {
    return this.tenantRepository.delete(id);
  }

  async tenantToJson(tenant) {
    const tenantObject = await tenant
    return {
      id: tenantObject.id,
      created_at: moment(tenantObject.created_at).local().format(dateFormat),
      updated_at: moment(tenantObject.updated_at).local().format(dateFormat),
      name: tenantObject.name,
      user_id: tenantObject.user_id,
      contract_begin_at: moment(tenantObject.contract_begin_at).local().format(dateFormat),
      contract_end_at: moment(tenantObject.contract_end_at).local().format(dateFormat),
      status: tenantObject.status,
      code: tenantObject.code,
      rent_duration: tenantObject.rent_duration,
      rent_duration_unit: DurationUnitStr[tenantObject.rent_duration_unit],
      created_by: tenantObject.created_by
    }
  }
}

module.exports = TenantUseCase;
