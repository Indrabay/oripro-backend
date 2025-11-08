const sequelize = require('../models/sequelize');
const {
  ComplaintReportType,
  ComplaintReportStatusStrToInt,
  ComplaintReportStatusIntToStr,
  ComplaintReportPriorityStrToInt,
  ComplaintReportPriorityIntToStr,
} = require('../models/ComplaintReport');

class ComplaintReportUsecase {
  constructor(complaintReportRepository, userRepository, tenantRepository) {
    this.complaintReportRepository = complaintReportRepository;
    this.userRepository = userRepository;
    this.tenantRepository = tenantRepository;
  }

  async createComplaintReport(data, ctx) {
    try {
      ctx.log?.info(data, 'ComplaintReportUsecase.createComplaintReport');

      // Get reporter user info to determine type
      const reporter = await this.userRepository.findById(data.reporter_id, ctx);
      if (!reporter) {
        throw new Error('Reporter user not found');
      }

      // Determine type based on reporter's role
      // Internal roles: admin, super_admin, security, cleaning
      const internalRoles = ['admin', 'super_admin', 'security', 'cleaning'];
      const reporterRoleName = reporter.role?.name?.toLowerCase();
      const isInternal = reporterRoleName && internalRoles.includes(reporterRoleName);

      let type = ComplaintReportType.COMPLAINT;
      let tenantId = null;

      if (isInternal) {
        type = ComplaintReportType.REPORT;
      } else {
        // For non-internal users, try to find their tenant record
        // If found, it's a complaint with tenant_id, otherwise still a complaint but without tenant_id
        try {
          const tenant = await this.tenantRepository.findAll({ user_id: data.reporter_id }, ctx);
          if (tenant.tenants && tenant.tenants.length > 0) {
            tenantId = tenant.tenants[0].id;
          }
        } catch (error) {
          ctx.log?.warn({ reporter_id: data.reporter_id, error: error.message }, 'Could not find tenant for reporter');
        }
        type = ComplaintReportType.COMPLAINT;
      }

      // Convert status and priority from string to int if provided
      const status = data.status !== undefined
        ? (typeof data.status === 'string' ? ComplaintReportStatusStrToInt[data.status] : data.status)
        : 0;
      const priority = data.priority !== undefined
        ? (typeof data.priority === 'string' ? ComplaintReportPriorityStrToInt[data.priority] : data.priority)
        : 1;

      const createData = {
        type,
        title: data.title,
        description: data.description,
        reporter_id: data.reporter_id,
        tenant_id: tenantId,
        status,
        priority,
        created_by: ctx.userId,
        updated_by: ctx.userId,
      };

      const complaintReport = await this.complaintReportRepository.create(createData, ctx);
      
      // Convert status and priority back to string for response
      const result = {
        ...complaintReport,
        status: ComplaintReportStatusIntToStr[complaintReport.status],
        priority: ComplaintReportPriorityIntToStr[complaintReport.priority],
      };

      return result;
    } catch (error) {
      ctx.log?.error({ data, error: error.message, errorStack: error.stack }, 'ComplaintReportUsecase.createComplaintReport_error');
      throw error;
    }
  }

  async getComplaintReportById(id, ctx) {
    try {
      ctx.log?.info({ id }, 'ComplaintReportUsecase.getComplaintReportById');
      const complaintReport = await this.complaintReportRepository.findById(id, ctx);
      
      if (!complaintReport) {
        return null;
      }

      // Convert status and priority to string
      return {
        ...complaintReport,
        status: ComplaintReportStatusIntToStr[complaintReport.status],
        priority: ComplaintReportPriorityIntToStr[complaintReport.priority],
      };
    } catch (error) {
      ctx.log?.error({ id, error: error.message }, 'ComplaintReportUsecase.getComplaintReportById_error');
      throw error;
    }
  }

  async getAllComplaintReports(filters = {}, ctx) {
    try {
      ctx.log?.info({ filters }, 'ComplaintReportUsecase.getAllComplaintReports');

      // Convert status and priority from string to int if provided
      const queryFilters = { ...filters };
      if (queryFilters.status && typeof queryFilters.status === 'string') {
        queryFilters.status = ComplaintReportStatusStrToInt[queryFilters.status];
      }
      if (queryFilters.priority && typeof queryFilters.priority === 'string') {
        queryFilters.priority = ComplaintReportPriorityStrToInt[queryFilters.priority];
      }

      const result = await this.complaintReportRepository.findAll(queryFilters, ctx);

      // Convert status and priority to string for each item
      const complaintReports = result.complaintReports.map(cr => ({
        ...cr,
        status: ComplaintReportStatusIntToStr[cr.status],
        priority: ComplaintReportPriorityIntToStr[cr.priority],
      }));

      return {
        complaintReports,
        total: result.total
      };
    } catch (error) {
      ctx.log?.error({ filters, error: error.message }, 'ComplaintReportUsecase.getAllComplaintReports_error');
      throw error;
    }
  }

  async updateComplaintReport(id, data, ctx) {
    try {
      ctx.log?.info({ id, data }, 'ComplaintReportUsecase.updateComplaintReport');

      const existing = await this.complaintReportRepository.findById(id, ctx);
      if (!existing) {
        throw new Error('Complaint/Report not found');
      }

      // Convert status and priority from string to int if provided
      const updateData = { ...data };
      if (updateData.status !== undefined && typeof updateData.status === 'string') {
        updateData.status = ComplaintReportStatusStrToInt[updateData.status];
      }
      if (updateData.priority !== undefined && typeof updateData.priority === 'string') {
        updateData.priority = ComplaintReportPriorityStrToInt[updateData.priority];
      }

      updateData.updated_by = ctx.userId;

      const updated = await this.complaintReportRepository.update(id, updateData, ctx);

      // Convert status and priority back to string
      return {
        ...updated,
        status: ComplaintReportStatusIntToStr[updated.status],
        priority: ComplaintReportPriorityIntToStr[updated.priority],
      };
    } catch (error) {
      ctx.log?.error({ id, data, error: error.message }, 'ComplaintReportUsecase.updateComplaintReport_error');
      throw error;
    }
  }

  async deleteComplaintReport(id, ctx) {
    try {
      ctx.log?.info({ id }, 'ComplaintReportUsecase.deleteComplaintReport');
      const result = await this.complaintReportRepository.delete(id, ctx);
      return result;
    } catch (error) {
      ctx.log?.error({ id, error: error.message }, 'ComplaintReportUsecase.deleteComplaintReport_error');
      throw error;
    }
  }
}

module.exports = ComplaintReportUsecase;

