class ComplaintReportEvidenceRepository {
  constructor(complaintReportEvidenceModel, complaintReportModel) {
    this.complaintReportEvidenceModel = complaintReportEvidenceModel;
    this.complaintReportModel = complaintReportModel;
  }

  async create(data, ctx = {}, tx = null) {
    try {
      ctx.log?.info(data, 'ComplaintReportEvidenceRepository.create');
      const evidence = await this.complaintReportEvidenceModel.create({
        complaint_report_id: data.complaint_report_id,
        url: data.url,
      }, {
        transaction: tx || ctx.transaction
      });
      return evidence.toJSON();
    } catch (error) {
      ctx.log?.error({ data, error }, 'ComplaintReportEvidenceRepository.create_error');
      throw error;
    }
  }

  async findById(id, ctx = {}) {
    try {
      ctx.log?.info({ id }, 'ComplaintReportEvidenceRepository.findById');
      const evidence = await this.complaintReportEvidenceModel.findByPk(id, {
        include: [
          {
            model: this.complaintReportModel,
            as: 'complaintReport',
            attributes: ['id', 'title', 'type']
          }
        ]
      });
      return evidence ? evidence.toJSON() : null;
    } catch (error) {
      ctx.log?.error({ id, error }, 'ComplaintReportEvidenceRepository.findById_error');
      throw error;
    }
  }

  async findByComplaintReportId(complaintReportId, ctx = {}) {
    try {
      ctx.log?.info({ complaintReportId }, 'ComplaintReportEvidenceRepository.findByComplaintReportId');
      const evidences = await this.complaintReportEvidenceModel.findAll({
        where: { complaint_report_id: complaintReportId },
        order: [['created_at', 'ASC']]
      });
      return evidences.map(evidence => evidence.toJSON());
    } catch (error) {
      ctx.log?.error({ complaintReportId, error }, 'ComplaintReportEvidenceRepository.findByComplaintReportId_error');
      throw error;
    }
  }

  async update(id, data, ctx = {}, tx = null) {
    try {
      ctx.log?.info({ id, data }, 'ComplaintReportEvidenceRepository.update');
      await this.complaintReportEvidenceModel.update(data, {
        where: { id },
        transaction: tx || ctx.transaction
      });
      const evidence = await this.findById(id, ctx);
      return evidence;
    } catch (error) {
      ctx.log?.error({ id, data, error }, 'ComplaintReportEvidenceRepository.update_error');
      throw error;
    }
  }

  async delete(id, ctx = {}, tx = null) {
    try {
      ctx.log?.info({ id }, 'ComplaintReportEvidenceRepository.delete');
      await this.complaintReportEvidenceModel.destroy({
        where: { id },
        transaction: tx || ctx.transaction
      });
      return true;
    } catch (error) {
      ctx.log?.error({ id, error }, 'ComplaintReportEvidenceRepository.delete_error');
      throw error;
    }
  }

  async deleteByComplaintReportId(complaintReportId, ctx = {}, tx = null) {
    try {
      ctx.log?.info({ complaintReportId }, 'ComplaintReportEvidenceRepository.deleteByComplaintReportId');
      await this.complaintReportEvidenceModel.destroy({
        where: { complaint_report_id: complaintReportId },
        transaction: tx || ctx.transaction
      });
      return true;
    } catch (error) {
      ctx.log?.error({ complaintReportId, error }, 'ComplaintReportEvidenceRepository.deleteByComplaintReportId_error');
      throw error;
    }
  }
}

module.exports = ComplaintReportEvidenceRepository;

