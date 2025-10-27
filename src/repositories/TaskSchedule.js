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
}

module.exports = TaskScheduleRepository;