const moment = require("moment");
const sequelize = require("../models/sequelize");
const dateFormat = "DD-MM-YYYY HH:mm";
const PrefixTenant = "TENT";
const {
  DurationUnit,
  DurationUnitStr,
  TenantStatusIntToStr,
} = require("../models/Tenant");
const { AttachmentType } = require("../models/TenantAttachment");

class TenantUseCase {
  constructor(
    tenantRepository,
    tenantAttachmentRepository,
    tenantUnitRepository,
    tenantCategoryMapRepo,
    tenantCategoryRepo,
    unitRepository,
    tenantLogRepository
  ) {
    this.tenantRepository = tenantRepository;
    this.tenantAttachmentRepository = tenantAttachmentRepository;
    this.tenantUnitRepository = tenantUnitRepository;
    this.tenantCategoryMapRepo = tenantCategoryMapRepo;
    this.tenantCategoryRepo = tenantCategoryRepo;
    this.unitRepository = unitRepository;
    this.tenantLogRepository = tenantLogRepository;
  }

  async createTenant(data, ctx) {
    try {
      ctx.log?.info(data, "TenantUsecase.createTenant");
      const result = await sequelize.transaction(async (t) => {
        const createTenantData = {
          user_id: data.user_id,
          name: data.name,
          contract_begin_at: data.contract_begin_at,
          contract_end_at: this.calculateDueDate(
            data.contract_begin_at,
            data.rent_duration,
            data.rent_duration_unit
          ),
          code: this.generateCode(),
          created_by: data.createdBy,
          rent_duration: data.rent_duration,
          rent_duration_unit: DurationUnit[data.rent_duration_unit],
          status: 2, // pending
        };
        const tenant = await this.tenantRepository.create(
          createTenantData,
          t,
          ctx
        );

        if (tenant) {
          await this.saveTenantAttachments(
            tenant,
            data.tenant_identifications,
            "id",
            t,
            ctx
          );
          await this.saveTenantAttachments(
            tenant,
            data.contract_documents,
            "contract",
            t,
            ctx
          );
          await this.saveCategories(
            tenant,
            data.categories,
            data.createdBy,
            t,
            ctx
          );
          await this.saveTenantUnits(tenant, data.unit_ids, t, ctx);
        }

        const tenantLog = {
          tenant_id: tenant.id,
          action: 'CREATE',
          old_data: null,
          new_data: {
            name: tenant.name,
            code: tenant.code,
            status: TenantStatusIntToStr[tenant.status], // Convert to string for log
            rent_duration: tenant.rent_duration,
            rent_duration_unit: DurationUnitStr[tenant.rent_duration_unit], // Convert back to string for log
          },
          created_by: ctx.userId,
        };

        await this.tenantLogRepository.create(tenantLog, ctx);
        return this.tenantToJson(tenant);
      });

      return result;
    } catch (error) {
      ctx.log?.error(data, "TenantUsecase.create_error");
      throw new Error(`error create tenant. with err: ${error.message}`);
    }
  }

  async saveTenantUnits(tenant, data, t, ctx) {
    ctx.log?.info({ unit_ids: data }, "TenantUsecase.saveTenantUnits");
    for (let i = 0; i < data.length; i++) {
      let dataUnit = {
        tenant_id: tenant.id,
        unit_id: data[i],
      };

      await this.tenantUnitRepository.create(dataUnit, t, ctx);
    }
  }

  async saveCategories(tenant, data, createdBy, tx, ctx) {
    ctx.log?.info({ tenant_id: tenant.id }, "TenantUsecase.saveCategories");
    for (let i = 0; i < data.length; i++) {
      let dataCategories = {
        tenant_id: tenant.id,
        status: 1,
        category_id: data[i],
        created_by: createdBy,
      };

      await this.tenantCategoryMapRepo.create(dataCategories, tx, ctx);
    }
  }

  async saveTenantAttachments(tenant, data, type, tx, ctx) {
    ctx.log?.info(
      { tenant_id: tenant.id, attachment_type: AttachmentType[type] },
      "TenantUsecase.saveTenantAttachments"
    );
    for (let i = 0; i < data.length; i++) {
      let attachmentType = AttachmentType[type];
      let dataAttachment = {
        tenant_id: tenant.id,
        url: data[i],
        status: 1,
        attachment_type: attachmentType,
      };

      await this.tenantAttachmentRepository.create(dataAttachment, tx, ctx);
    }
  }

  calculateDueDate(beginDate, rent_duration, rent_unit) {
    let endDate = moment(beginDate).tz("Asia/Jakarta");
    if (rent_unit == "year") {
      endDate.add(rent_duration, "years");
    } else {
      endDate.add(rent_duration, "months");
    }

    return endDate;
  }

  generateCode() {
    return `${PrefixTenant}-${moment().local().format("DDMMYYYYHHmmss")}`;
  }

  async getTenantById(id, ctx) {
    try {
      ctx.log?.info({ tenant_id: id }, "TenantUsecase.getTenantById");
      const tenant = await this.tenantRepository.findById(id, ctx);

      if (tenant) {
        const tenantUnits = await this.tenantUnitRepository.getByTenantID(
          tenant.id
        );

        if (tenantUnits.length > 0) {
          let units = [];
          for (let i = 0; i < tenantUnits.length; i++) {
            let unit = await this.unitRepository.findById(
              tenantUnits[i].unit_id
            );
            units.push(unit);
          }

          tenant.units = units;
        }

        const attachments = await this.tenantAttachmentRepository.getByTenantID(
          tenant.id
        );
        if (attachments.length > 0) {
          let idAttachments = [];
          let contractAttachments = [];
          for (let i = 0; i < attachments.length; i++) {
            if (attachments[i].attachment_type == AttachmentType["id"]) {
              idAttachments.push(attachments[i].url);
            } else {
              contractAttachments.push(attachments[i].url);
            }
          }

          tenant.tenant_identifications = idAttachments;
          tenant.contract_documents = contractAttachments;
        }

        const tenantCategories =
          await this.tenantCategoryMapRepo.findByTenantID(tenant.id);
        if (tenantCategories.length > 0) {
          let categories = [];
          for (let i = 0; i < tenantCategories.length; i++) {
            let category = await this.tenantCategoryRepo.getByID(
              tenantCategories[i].category_id
            );

            categories.push(category);
          }

          tenant.categories = categories;
        }
      }

      tenant.status = TenantStatusIntToStr[tenant.status];

      return tenant;
    } catch (error) {
      ctx.log?.error({tenant_id: id}, `TenantUsecase.getTenantById_error: ${error.message}`);
      throw error
    }
  }

  async getAllTenants(filter = {}, ctx) {
    try {
      ctx.log?.info(filter, "TenantUsecase.getAllTenants");
      const data = await this.tenantRepository.findAll(filter, ctx);

      // Process each tenant to include attachments, units, and categories
      const processedTenants = await Promise.all(
        data.tenants.map(async (tenant) => {
          // Get tenant units
          const tenantUnits = await this.tenantUnitRepository.getByTenantID(
            tenant.id
          );
          if (tenantUnits.length > 0) {
            let units = [];
            for (let i = 0; i < tenantUnits.length; i++) {
              let unit = await this.unitRepository.findById(
                tenantUnits[i].unit_id
              );
              units.push(unit);
            }
            tenant.units = units;
          }

          // Get tenant attachments
          const attachments =
            await this.tenantAttachmentRepository.getByTenantID(tenant.id);
          if (attachments.length > 0) {
            let idAttachments = [];
            let contractAttachments = [];
            for (let i = 0; i < attachments.length; i++) {
              if (attachments[i].attachment_type == AttachmentType["id"]) {
                idAttachments.push(attachments[i].url);
              } else {
                contractAttachments.push(attachments[i].url);
              }
            }

            tenant.tenant_identifications = idAttachments;
            tenant.contract_documents = contractAttachments;
          }

          // Get tenant categories
          const tenantCategories =
            await this.tenantCategoryMapRepo.findByTenantID(tenant.id);
          if (tenantCategories.length > 0) {
            let categories = [];
            for (let i = 0; i < tenantCategories.length; i++) {
              let category = await this.tenantCategoryRepo.getByID(
                tenantCategories[i].category_id
              );
              categories.push(category);
            }
            tenant.categories = categories;
          }

          // Convert status to string
          tenant.status = TenantStatusIntToStr[tenant.status];

          return tenant;
        })
      );

      return {
        tenants: processedTenants,
        total: data.total,
      };
    } catch (error) {
      ctx.log?.error(filter, "TenantUsecase.getAllTenants_error");
      throw new Error(`error get tenants. with err: ${error.message}`);
    }
  }

  async updateTenant(id, data, ctx) {
    try {
      ctx.log?.info({ tenant_id: id, update_data: data }, "TenantUsecase.updateTenant");
      
      // Get old data before update
      const oldTenant = await this.tenantRepository.findById(id, ctx);
      if (!oldTenant) {
        throw new Error('Tenant not found');
      }

      // Update tenant
      const updatedTenant = await this.tenantRepository.update(id, data);
      
      // Create log entry - only log changed fields
      const changedFields = {};
      const oldData = {};
      
      // Check each field for changes
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== oldTenant[key]) {
          if (key === 'rent_duration_unit') {
            // Convert integer to string for old data
            oldData[key] = DurationUnitStr[oldTenant[key]];
            // Convert string to string for new data (if it's string) or integer to string
            changedFields[key] = typeof data[key] === 'string' ? data[key] : DurationUnitStr[data[key]];
          } else {
            oldData[key] = oldTenant[key];
            changedFields[key] = data[key];
          }
        }
      });

      // Only create log if there are actual changes
      if (Object.keys(changedFields).length > 0) {
        const tenantLog = {
          tenant_id: id,
          action: 'UPDATE',
          old_data: oldData,
          new_data: changedFields,
          created_by: ctx.userId,
        };

        await this.tenantLogRepository.create(tenantLog, ctx);
      }
      
      return updatedTenant;
    } catch (error) {
      ctx.log?.error({ tenant_id: id, update_data: data }, `TenantUsecase.updateTenant_error: ${error.message}`);
      throw error;
    }
  }

  async deleteTenant(id, ctx) {
    const transaction = await sequelize.transaction();
    try {
      ctx.log?.info({ tenant_id: id }, "TenantUsecase.deleteTenant");
      
      // Get tenant data before delete
      const tenant = await this.tenantRepository.findById(id, ctx);
      if (!tenant) {
        throw new Error('Tenant not found');
      }

      // Create log entry before deletion - only store essential data
      const tenantLog = {
        tenant_id: id,
        action: 'DELETE',
        old_data: {
          name: tenant.name,
          code: tenant.code,
          status: TenantStatusIntToStr[tenant.status], // Convert to string for log
        },
        new_data: null,
        created_by: ctx.userId,
      };

      await this.tenantLogRepository.create(tenantLog, { ...ctx, transaction });
      
      // Delete related data first
      // Delete tenant units
      await this.tenantUnitRepository.deleteByTenantId(id, { ...ctx, transaction });
      
      // Delete tenant attachments
      await this.tenantAttachmentRepository.deleteByTenantId(id, { ...ctx, transaction });
      
      // Delete tenant category mappings
      await this.tenantCategoryMapRepo.deleteByTenantId(id, { ...ctx, transaction });
      
      // Delete tenant
      const result = await this.tenantRepository.delete(id, { ...ctx, transaction });
      
      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      ctx.log?.error({ tenant_id: id }, `TenantUsecase.deleteTenant_error: ${error.message}`);
      throw error;
    }
  }

  async getTenantLogs(id, ctx) {
    ctx.log?.info({ tenant_id: id }, "TenantUsecase.getTenantLogs");
    let tenantLogs = await this.tenantLogRepository.findByTenantID(id, ctx);
    return tenantLogs;
  }

  async tenantToJson(tenant) {
    const tenantObject = await tenant;
    return {
      id: tenantObject.id,
      created_at: moment(tenantObject.created_at).local().format(dateFormat),
      updated_at: moment(tenantObject.updated_at).local().format(dateFormat),
      name: tenantObject.name,
      user_id: tenantObject.user_id,
      contract_begin_at: moment(tenantObject.contract_begin_at)
        .local()
        .format(dateFormat),
      contract_end_at: moment(tenantObject.contract_end_at)
        .local()
        .format(dateFormat),
      status: tenantObject.status,
      code: tenantObject.code,
      rent_duration: tenantObject.rent_duration,
      rent_duration_unit: DurationUnitStr[tenantObject.rent_duration_unit],
      created_by: tenantObject.created_by,
    };
  }
}

module.exports = TenantUseCase;
