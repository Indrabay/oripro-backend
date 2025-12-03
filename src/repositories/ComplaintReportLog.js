class ComplaintReportLogRepository {
  constructor(complaintReportLogModel, userModel) {
    this.complaintReportLogModel = complaintReportLogModel;
    this.userModel = userModel;
  }

  async create(data, ctx = {}, tx = null) {
    try {
      ctx.log?.info(data, 'ComplaintReportLogRepository.create');
      const log = await this.complaintReportLogModel.create({
        complaint_report_id: data.complaint_report_id,
        old_status: data.old_status,
        new_status: data.new_status,
        notes: data.notes,
        photo_evidence_url: data.photo_evidence_url,
        created_by: data.created_by,
      }, {
        transaction: tx || ctx.transaction
      });
      return log.toJSON();
    } catch (error) {
      ctx.log?.error({ data, error: error.message }, 'ComplaintReportLogRepository.create_error');
      throw error;
    }
  }

  async findByComplaintReportId(complaintReportId, ctx = {}, tx = null) {
    try {
      ctx.log?.info({ complaintReportId }, 'ComplaintReportLogRepository.findByComplaintReportId');
      const logs = await this.complaintReportLogModel.findAll({
        where: { complaint_report_id: complaintReportId },
        include: [
          {
            model: this.userModel,
            as: 'createdBy',
            attributes: ['id', 'name', 'email']
          }
        ],
        order: [['created_at', 'DESC']],
        transaction: tx || ctx.transaction
      });
      return logs.map(log => log.toJSON());
    } catch (error) {
      ctx.log?.error({ complaintReportId, error: error.message }, 'ComplaintReportLogRepository.findByComplaintReportId_error');
      throw error;
    }
  }
}

module.exports = ComplaintReportLogRepository;

