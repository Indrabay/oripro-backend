class TaskGroupRepository {
  constructor(taskGroupModel) {
    this.taskGroupModel = taskGroupModel;
  }

  async create(data, ctx = {}, tx = null) {
    try {
      ctx.log?.info(data, 'TaskGroupRepository.create');
      const taskGroup = await this.taskGroupModel.create(data, { transaction: tx });
      return taskGroup.toJSON();
    } catch (error) {
      ctx.log?.error({ data, error }, 'TaskGroupRepository.create_error');
      throw error;
    }
  }

  async findById(id, ctx = {}) {
    try {
      ctx.log?.info({ id }, 'TaskGroupRepository.findById');
      const taskGroup = await this.taskGroupModel.findByPk(id);
      if (!taskGroup) return null;
      return taskGroup.toJSON();
    } catch (error) {
      ctx.log?.error({ id, error }, 'TaskGroupRepository.findById_error');
      throw error;
    }
  }

  async findAll(filter = {}, ctx = {}) {
    try {
      ctx.log?.info({ filter }, 'TaskGroupRepository.findAll');
      const taskGroups = await this.taskGroupModel.findAll({
        where: filter,
        order: [['created_at', 'DESC']],
      });
      return taskGroups.map(tg => tg.toJSON());
    } catch (error) {
      ctx.log?.error({ filter, error }, 'TaskGroupRepository.findAll_error');
      throw error;
    }
  }

  async update(id, data, ctx = {}, tx = null) {
    try {
      ctx.log?.info({ id, data }, 'TaskGroupRepository.update');
      const updateData = {
        ...data,
        updated_at: new Date(),
      };
      await this.taskGroupModel.update(updateData, {
        where: { id },
        transaction: tx
      });
      const taskGroup = await this.findById(id, ctx);
      return taskGroup;
    } catch (error) {
      ctx.log?.error({ id, data, error }, 'TaskGroupRepository.update_error');
      throw error;
    }
  }

  async delete(id, ctx = {}, tx = null) {
    try {
      ctx.log?.info({ id }, 'TaskGroupRepository.delete');
      await this.taskGroupModel.destroy({
        where: { id },
        transaction: tx
      });
      return true;
    } catch (error) {
      ctx.log?.error({ id, error }, 'TaskGroupRepository.delete_error');
      throw error;
    }
  }
}

module.exports = TaskGroupRepository;

