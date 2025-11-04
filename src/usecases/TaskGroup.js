class TaskGroupUseCase {
  constructor(taskGroupRepository) {
    this.taskGroupRepository = taskGroupRepository;
  }

  async listAllTaskGroups(filter = {}, ctx = {}) {
    ctx.log?.info({ filter }, 'usecase_list_all_task_groups');
    try {
      const taskGroups = await this.taskGroupRepository.findAll(filter, ctx);
      return taskGroups;
    } catch (error) {
      ctx.log?.error({ error: error.message }, 'usecase_list_all_task_groups_error');
      throw error;
    }
  }

  async getTaskGroupById(id, ctx = {}) {
    ctx.log?.info({ id }, 'usecase_get_task_group_by_id');
    try {
      const taskGroup = await this.taskGroupRepository.findById(id, ctx);
      return taskGroup;
    } catch (error) {
      ctx.log?.error({ error: error.message }, 'usecase_get_task_group_by_id_error');
      throw error;
    }
  }

  async createTaskGroup(taskGroupData, ctx = {}) {
    ctx.log?.info({ taskGroupData }, 'usecase_create_task_group');
    try {
      const taskGroup = await this.taskGroupRepository.create({
        ...taskGroupData,
        created_by: ctx.userId,
      }, ctx);
      return taskGroup;
    } catch (error) {
      ctx.log?.error({ error: error.message }, 'usecase_create_task_group_error');
      throw error;
    }
  }

  async updateTaskGroup(id, taskGroupData, ctx = {}) {
    ctx.log?.info({ id, taskGroupData }, 'usecase_update_task_group');
    try {
      const taskGroup = await this.taskGroupRepository.update(id, taskGroupData, ctx);
      return taskGroup;
    } catch (error) {
      ctx.log?.error({ error: error.message }, 'usecase_update_task_group_error');
      throw error;
    }
  }

  async deleteTaskGroup(id, ctx = {}) {
    ctx.log?.info({ id }, 'usecase_delete_task_group');
    try {
      const deleted = await this.taskGroupRepository.delete(id, ctx);
      return deleted;
    } catch (error) {
      ctx.log?.error({ error: error.message }, 'usecase_delete_task_group_error');
      throw error;
    }
  }
}

module.exports = TaskGroupUseCase;

