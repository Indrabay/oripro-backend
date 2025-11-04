class TaskLogRepository {
  constructor(taskLogModel, userModel) {
    this.taskLogModel = taskLogModel;
    this.userModel = userModel;
  }

  async create({ id, name, is_main_task, is_need_validation, is_scan, scan_code, duration, asset_id, role_id, is_all_times, parent_task_id }, ctx = {}, tx = null) {
    try {
      ctx.log?.info({id, name, asset_id, role_id}, 'TaskLogRepository.create');
      const logData = {
        task_id: id,
        name,
        is_main_task,
        is_need_validation,
        is_scan,
        scan_code,
        duration,
        asset_id,
        role_id,
        is_all_times,
        parent_task_id,
        created_by: ctx.userId
      };
      ctx.log?.info({ logData }, 'TaskLogRepository.create_data');
      await this.taskLogModel.create(logData, { transaction: tx});
    } catch (error) {
      ctx.log?.error({ id, name, error: error.message, errorStack: error.stack }, 'TaskLogRepository.create_error');
      throw error;
    }
  }

  async getByTaskID(id, ctx = {}) {
    ctx.log?.info({task_id: id}, 'TaskLogRepository.getByTaskID');
    const taskLogs = await this.taskLogModel.findAll({
      where: { task_id: id },
      order: [['created_at', 'DESC']],
      include: [
        {
          model: this.userModel,
          as: 'createdBy',
          attributes: ['id', 'name', 'email']
        },
      ]
    });

    return taskLogs.map(tl => {
      const taskLog = tl.toJSON()
      taskLog.created_by = taskLog.createdBy
      delete taskLog.createdBy
      return taskLog
    })
  }
}

module.exports = TaskLogRepository;

