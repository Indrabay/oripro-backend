class TaskParentRepository {
  constructor(taskParentModel) {
    this.taskParentModel = taskParentModel;
  }

  async create(childTaskId, parentTaskId, ctx = {}, tx = null) {
    try {
      ctx.log?.info({ childTaskId, parentTaskId }, 'TaskParentRepository.create');
      const taskParent = await this.taskParentModel.create({
        child_task_id: childTaskId,
        parent_task_id: parentTaskId,
        created_at: new Date(),
      }, { transaction: tx });
      return taskParent.toJSON();
    } catch (error) {
      ctx.log?.error({ childTaskId, parentTaskId, error }, 'TaskParentRepository.create_error');
      throw error;
    }
  }

  async createMany(childTaskId, parentTaskIds, ctx = {}, tx = null) {
    try {
      ctx.log?.info({ childTaskId, parentTaskIds }, 'TaskParentRepository.createMany');
      const taskParents = await Promise.all(
        parentTaskIds.map(parentTaskId =>
          this.create(childTaskId, parentTaskId, ctx, tx)
        )
      );
      return taskParents;
    } catch (error) {
      ctx.log?.error({ childTaskId, parentTaskIds, error }, 'TaskParentRepository.createMany_error');
      throw error;
    }
  }

  async deleteByChildTask(childTaskId, ctx = {}, tx = null) {
    try {
      ctx.log?.info({ childTaskId }, 'TaskParentRepository.deleteByChildTask');
      await this.taskParentModel.destroy({
        where: { child_task_id: childTaskId },
        transaction: tx
      });
      return true;
    } catch (error) {
      ctx.log?.error({ childTaskId, error }, 'TaskParentRepository.deleteByChildTask_error');
      throw error;
    }
  }

  async getParentTaskIds(childTaskId, ctx = {}) {
    try {
      ctx.log?.info({ childTaskId }, 'TaskParentRepository.getParentTaskIds');
      const taskParents = await this.taskParentModel.findAll({
        where: { child_task_id: childTaskId },
        attributes: ['parent_task_id']
      });
      return taskParents.map(tp => tp.parent_task_id);
    } catch (error) {
      ctx.log?.error({ childTaskId, error }, 'TaskParentRepository.getParentTaskIds_error');
      throw error;
    }
  }

  async getChildTaskIds(parentTaskId, ctx = {}) {
    try {
      ctx.log?.info({ parentTaskId }, 'TaskParentRepository.getChildTaskIds');
      const taskParents = await this.taskParentModel.findAll({
        where: { parent_task_id: parentTaskId },
        attributes: ['child_task_id']
      });
      return taskParents.map(tp => tp.child_task_id);
    } catch (error) {
      ctx.log?.error({ parentTaskId, error }, 'TaskParentRepository.getChildTaskIds_error');
      throw error;
    }
  }
}

module.exports = TaskParentRepository;

