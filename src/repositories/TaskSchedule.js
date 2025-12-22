class TaskScheduleRepository {
  constructor(taskScheduleModel) {
    this.taskScheduleModel = taskScheduleModel;
  }

  async create(t = null, data, ctx) {
    try {
      ctx.log?.info(data, "TaskScheduleRepository.create");
      const taskSchedule = await this.taskScheduleModel.create(data, { transaction: t});
      return taskSchedule;
    } catch (error) {
      ctx.log?.error({data, error}, "TaskScheduleRepository.create_error");
      throw error;
    }
  }

  async findByTaskId(taskId, ctx = {}, tx = null) {
    try {
      ctx.log?.info({ taskId }, "TaskScheduleRepository.findByTaskId");
      const schedules = await this.taskScheduleModel.findAll({
        where: { task_id: taskId },
        order: [['day_of_week', 'ASC'], ['time', 'ASC']],
        transaction: tx
      });
      return schedules.map(schedule => schedule.toJSON ? schedule.toJSON() : schedule);
    } catch (error) {
      ctx.log?.error({ taskId, error }, "TaskScheduleRepository.findByTaskId_error");
      throw error;
    }
  }

  async deleteByTaskId(taskId, ctx = {}, tx = null) {
    try {
      ctx.log?.info({ taskId }, "TaskScheduleRepository.deleteByTaskId");
      const deleted = await this.taskScheduleModel.destroy({
        where: { task_id: taskId },
        transaction: tx
      });
      return deleted;
    } catch (error) {
      ctx.log?.error({ taskId, error }, "TaskScheduleRepository.deleteByTaskId_error");
      throw error;
    }
  }
}

module.exports = TaskScheduleRepository;