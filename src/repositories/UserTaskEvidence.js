class UserTaskEvidenceRepository {
  constructor(userTaskEvidenceModel, userTaskModel) {
    this.userTaskEvidenceModel = userTaskEvidenceModel;
    this.userTaskModel = userTaskModel;
  }

  async create(data, ctx = {}, tx = null) {
    try {
      ctx.log?.info(data, 'UserTaskEvidenceRepository.create');
      const evidence = await this.userTaskEvidenceModel.create({
        user_task_id: data.user_task_id,
        evidence_type: data.evidence_type,
        file_path: data.file_path,
        file_name: data.file_name,
        file_size: data.file_size,
        mime_type: data.mime_type,
        scan_code: data.scan_code,
        latitude: data.latitude,
        longitude: data.longitude,
        description: data.description,
      }, { transaction: tx });
      return evidence.toJSON();
    } catch (error) {
      ctx.log?.error({ data, error }, 'UserTaskEvidenceRepository.create_error');
      throw error;
    }
  }

  async findById(id, ctx = {}) {
    try {
      ctx.log?.info({ id }, 'UserTaskEvidenceRepository.findById');
      const evidence = await this.userTaskEvidenceModel.findByPk(id, {
        include: [
          {
            model: this.userTaskModel,
            as: 'userTask',
            attributes: ['id', 'status', 'scheduled_date', 'scheduled_time']
          }
        ]
      });
      return evidence;
    } catch (error) {
      ctx.log?.error({ id, error }, 'UserTaskEvidenceRepository.findById_error');
      throw error;
    }
  }

  async findByUserTaskId(userTaskId, ctx = {}) {
    try {
      ctx.log?.info({ userTaskId }, 'UserTaskEvidenceRepository.findByUserTaskId');
      const evidences = await this.userTaskEvidenceModel.findAll({
        where: { user_task_id: userTaskId },
        order: [['created_at', 'DESC']]
      });
      return evidences.map(evidence => evidence.toJSON());
    } catch (error) {
      ctx.log?.error({ userTaskId, error }, 'UserTaskEvidenceRepository.findByUserTaskId_error');
      throw error;
    }
  }

  async update(id, data, ctx = {}, tx = null) {
    try {
      ctx.log?.info({ id, data }, 'UserTaskEvidenceRepository.update');
      await this.userTaskEvidenceModel.update(data, {
        where: { id },
        transaction: tx
      });
      const evidence = await this.findById(id, ctx);
      return evidence;
    } catch (error) {
      ctx.log?.error({ id, data, error }, 'UserTaskEvidenceRepository.update_error');
      throw error;
    }
  }

  async delete(id, ctx = {}, tx = null) {
    try {
      ctx.log?.info({ id }, 'UserTaskEvidenceRepository.delete');
      await this.userTaskEvidenceModel.destroy({
        where: { id },
        transaction: tx
      });
      return true;
    } catch (error) {
      ctx.log?.error({ id, error }, 'UserTaskEvidenceRepository.delete_error');
      throw error;
    }
  }

  async deleteByUserTaskId(userTaskId, ctx = {}, tx = null) {
    try {
      ctx.log?.info({ userTaskId }, 'UserTaskEvidenceRepository.deleteByUserTaskId');
      await this.userTaskEvidenceModel.destroy({
        where: { user_task_id: userTaskId },
        transaction: tx
      });
      return true;
    } catch (error) {
      ctx.log?.error({ userTaskId, error }, 'UserTaskEvidenceRepository.deleteByUserTaskId_error');
      throw error;
    }
  }
}

module.exports = UserTaskEvidenceRepository;
