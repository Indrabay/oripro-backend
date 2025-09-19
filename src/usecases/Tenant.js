const moment = require('moment');

class TenantUseCase { 
  constructor(tenantRepository, tenantAttachmentRepository, tenantUnitRepository) {
    this.tenantRepository = tenantRepository;
    this.tenantAttachmentRepository = tenantAttachmentRepository;
    this.tenantUnitRepository = tenantUnitRepository;
  }

  async createTenant(data) {
    let contract_end_at = moment(data.contract_begin_at)
    if (data.rent_duration_unit == "year") {
      contract_end_at.add(data.rent_duration, 'years');
    } else {
      contract_end_at.add(data.rent_duration, 'months');
    }
    const createTenantData = {
      user_id: data.user_id,
      name: data.name,
      contract_begin_at: data.contract_begin_at,
      contract_end_at,
      code: '123',
      created_by: data.createdBy
    }
    const tenant = this.tenantRepository.create(createTenantData);
    return tenant
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
}

module.exports = TenantUseCase;
