const sequelize = require("../models/sequelize");

class TaskUsecase {
  constructor(taskRepository, taskScheduleRepository, taskLogRepository) {
    this.taskRepository = taskRepository;
    this.taskScheduleRepository = taskScheduleRepository;
    this.taskLogRepository = taskLogRepository;
  }

  async createTask(data, ctx) {
    try {
      ctx.log?.info(data, "TaskUsecase.createTask");
      const result = await sequelize.transaction(async (t) => {
        console.log("im here1", ctx)
        let createData = {
          name: data.name,
          is_main_task: data.is_main_task,
          is_need_validation: data.is_need_validation,
          is_scan: data.is_scan,
          scan_code: data.scan_code,
          duration: data.duration,
          asset_id: data.asset_id,
          role_id: data.role_id,
          is_all_times: data.is_all_times,
          parent_task_id: data.parent_task_id,
          task_group_id: data.task_group_id || null,
          created_by: ctx.userId,
        };
        console.log("im here2")
        const task = await this.taskRepository.create(t, createData, ctx);
        console.log("im here3")
        if (task) {
          console.log("im here4")
          let taskScheduleData = {
            task_id: task.id,
            created_by: ctx.userId,
          };
          if (data.days && data.days.length > 0) {
            for (let i = 0; i < data.days.length; i++) {
              taskScheduleData.day_of_week = data.days[i];
              if (data.times && data.times.length > 0) {
                for (let j = 0; j < data.times.length; j++) {
                  taskScheduleData.time = data.times[j];

                  await this.taskScheduleRepository.create(
                    t,
                    taskScheduleData,
                    ctx
                  );
                }
              } else {
                await this.taskScheduleRepository.create(
                  t,
                  taskScheduleData,
                  ctx
                );
              }
            }
          } else {
            taskScheduleData.day_of_week = "all";
            await this.taskScheduleRepository.create(t, taskScheduleData, ctx);
          }
        }

        return task;
      });
      return result;
    } catch (error) {
      ctx.log?.error(
        { req: data, error: error },
        "TaskUsecase.createTask_error"
      );
      throw error;
    }
  }

  async updateTask(id, data, ctx) {
    try {
      ctx.log?.info({ id, data }, "TaskUsecase.updateTask");
      const result = await sequelize.transaction(async (t) => {
        // First check if task exists
        const existingTask = await this.taskRepository.findById(id, ctx);
        if (!existingTask) {
          return null;
        }

        // Update task data
        let updateData = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.is_main_task !== undefined) updateData.is_main_task = data.is_main_task;
        if (data.is_need_validation !== undefined) updateData.is_need_validation = data.is_need_validation;
        if (data.is_scan !== undefined) updateData.is_scan = data.is_scan;
        if (data.scan_code !== undefined) updateData.scan_code = data.scan_code;
        if (data.duration !== undefined) updateData.duration = data.duration;
        if (data.asset_id !== undefined) updateData.asset_id = data.asset_id;
        if (data.role_id !== undefined) updateData.role_id = data.role_id;
        if (data.is_all_times !== undefined) updateData.is_all_times = data.is_all_times;
        if (data.parent_task_id !== undefined) updateData.parent_task_id = data.parent_task_id;
        if (data.task_group_id !== undefined) updateData.task_group_id = data.task_group_id;

        const task = await this.taskRepository.update(id, updateData, ctx, t);

        // Create log entry
        await this.taskLogRepository.create(task, ctx, t);

        return task;
      });
      return result;
    } catch (error) {
      ctx.log?.error(
        { id, data, error: error },
        "TaskUsecase.updateTask_error"
      );
      throw error;
    }
  }

  async getTaskLogs(id, ctx) {
    try {
      ctx.log?.info({ id }, "TaskUsecase.getTaskLogs");
      const taskLogs = await this.taskLogRepository.getByTaskID(id, ctx);
      return taskLogs;
    } catch (error) {
      ctx.log?.error(
        { id, error: error },
        "TaskUsecase.getTaskLogs_error"
      );
      throw error;
    }
  }
}

module.exports = TaskUsecase;
