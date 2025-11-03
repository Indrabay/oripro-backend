class TaskRepository {
  constructor(taskModel, userModel, roleModel, assetModel, taskGroupModel) {
    this.taskModel = taskModel;
    this.userModel = userModel;
    this.roleModel = roleModel;
    this.assetModel = assetModel;
    this.taskGroupModel = taskGroupModel;
  }

  async create(transaction = null, data, ctx) {
    try {
      ctx.log?.info(data, "TaskRepository.create");
      const task = await this.taskModel.create(data, { transaction });
      return task;
    } catch (error) {
      ctx.log?.error({ data, error}, "TaskRepository.create_error");
      throw error;
    }
  }

  async findById(id, ctx) {
    try {
      ctx.log?.info({ id }, "TaskRepository.findById");
      const task = await this.taskModel.findByPk(id, {
        include: [
          {
            model: this.userModel,
            as: 'createdBy',
            attributes: ['id', 'name', 'email']
          },
          {
            model: this.roleModel,
            as: 'role',
            attributes: ['id', 'name', 'level']
          },
          {
            model: this.assetModel,
            as: 'asset',
            attributes: ['id', 'name', 'code']
          },
          ...(this.taskGroupModel ? [{
            model: this.taskGroupModel,
            as: 'taskGroup',
            attributes: ['id', 'name', 'start_time', 'end_time', 'description'],
            required: false
          }] : [])
        ]
      });
      return task;
    } catch (error) {
      ctx.log?.error({ id, error }, "TaskRepository.findById_error");
      throw error;
    }
  }

  async update(id, data, ctx, transaction = null) {
    try {
      ctx.log?.info({ id, data }, "TaskRepository.update");
      await this.taskModel.update(data, {
        where: { id },
        transaction
      });
      const task = await this.findById(id, ctx);
      return task;
    } catch (error) {
      ctx.log?.error({ id, data, error }, "TaskRepository.update_error");
      throw error;
    }
  }
  
  // async getNearestTask(ctx) {
  //   try {
  //     ctx.log?.info()
  //   } catch (error) {
      
  //   }
  // }
}

module.exports = TaskRepository;