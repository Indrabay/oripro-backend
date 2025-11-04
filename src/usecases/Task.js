const sequelize = require("../models/sequelize");

class TaskUsecase {
  constructor(taskRepository, taskScheduleRepository, taskLogRepository, taskParentRepository) {
    this.taskRepository = taskRepository;
    this.taskScheduleRepository = taskScheduleRepository;
    this.taskLogRepository = taskLogRepository;
    this.taskParentRepository = taskParentRepository;
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
          task_group_id: data.task_group_id || null,
          created_by: ctx.userId,
        };
        const task = await this.taskRepository.create(t, createData, ctx);
        
        // Handle multiple parent tasks using junction table
        if (task && data.parent_task_ids && Array.isArray(data.parent_task_ids) && data.parent_task_ids.length > 0) {
          await this.taskParentRepository.createMany(task.id, data.parent_task_ids, ctx, t);
        }
        
        if (task) {
          const baseScheduleData = {
            task_id: task.id,
            created_by: ctx.userId,
          };

          if (data.days && data.days.length > 0) {
            // Days provided: use current logic
            for (let i = 0; i < data.days.length; i++) {
              const dayOfWeek = data.days[i];
              if (data.times && data.times.length > 0) {
                for (let j = 0; j < data.times.length; j++) {
                  const taskScheduleData = {
                    ...baseScheduleData,
                    day_of_week: dayOfWeek,
                    time: data.times[j],
                  };
                  await this.taskScheduleRepository.create(
                    t,
                    taskScheduleData,
                    ctx
                  );
                }
              } else {
                const taskScheduleData = {
                  ...baseScheduleData,
                  day_of_week: dayOfWeek,
                };
                await this.taskScheduleRepository.create(
                  t,
                  taskScheduleData,
                  ctx
                );
              }
            }
          } else {
            // Days empty: create for all times with day_of_week = "all"
            if (data.times && data.times.length > 0) {
              for (let j = 0; j < data.times.length; j++) {
                const taskScheduleData = {
                  ...baseScheduleData,
                  day_of_week: "all",
                  time: data.times[j],
                };
                await this.taskScheduleRepository.create(
                  t,
                  taskScheduleData,
                  ctx
                );
              }
            } else {
              const taskScheduleData = {
                ...baseScheduleData,
                day_of_week: "all",
              };
              await this.taskScheduleRepository.create(t, taskScheduleData, ctx);
            }
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
        if (data.task_group_id !== undefined) updateData.task_group_id = data.task_group_id;
        updateData.updated_by = ctx.userId;

        const task = await this.taskRepository.update(id, updateData, ctx, t);

        // Handle multiple parent tasks using junction table
        if (data.parent_task_ids !== undefined) {
          // Delete existing parent relationships
          await this.taskParentRepository.deleteByChildTask(id, ctx, t);
          // Create new parent relationships if provided
          if (Array.isArray(data.parent_task_ids) && data.parent_task_ids.length > 0) {
            await this.taskParentRepository.createMany(id, data.parent_task_ids, ctx, t);
          }
        }

        // Get parent_task_id from junction table for logging (use first parent if multiple)
        let parentTaskIdForLog = null;
        if (this.taskParentRepository) {
          const parentTaskIds = await this.taskParentRepository.getParentTaskIds(id, ctx);
          if (parentTaskIds && parentTaskIds.length > 0) {
            parentTaskIdForLog = parentTaskIds[0]; // Use first parent for log
          }
        }

        // Create log entry (pass parent_task_id from junction table)
        if (!id || !task) {
          ctx.log?.error({ id, task: !!task }, "TaskUsecase.updateTask_missing_id_or_task");
          throw new Error("Task ID or task data is missing");
        }
        
        // Extract only the fields we need for the log, avoiding circular references
        const taskData = task.toJSON ? task.toJSON() : task;
        const logEntryData = {
          id: id, // Explicitly set task_id (mapped from id in repository)
          name: taskData.name,
          is_main_task: taskData.is_main_task,
          is_need_validation: taskData.is_need_validation,
          is_scan: taskData.is_scan,
          scan_code: taskData.scan_code,
          duration: taskData.duration,
          asset_id: taskData.asset_id,
          role_id: taskData.role_id,
          is_all_times: taskData.is_all_times,
          parent_task_id: parentTaskIdForLog
        };
        
        ctx.log?.info({ 
          id, 
          name: logEntryData.name, 
          asset_id: logEntryData.asset_id, 
          role_id: logEntryData.role_id,
          parentTaskIdForLog 
        }, "TaskUsecase.updateTask_creating_log");
        
        try {
          await this.taskLogRepository.create(logEntryData, ctx, t);
        } catch (logError) {
          ctx.log?.error({ 
            id, 
            name: logEntryData.name,
            error: logError.message, 
            errorStack: logError.stack 
          }, "TaskUsecase.updateTask_create_log_error");
          throw logError;
        }

        // Convert task to plain JSON to avoid circular references in response
        const taskJson = task.toJSON ? task.toJSON() : task;
        // Clean up associations to plain objects to avoid circular references
        const cleanedTask = {
          id: taskJson.id,
          name: taskJson.name,
          is_main_task: taskJson.is_main_task,
          is_need_validation: taskJson.is_need_validation,
          is_scan: taskJson.is_scan,
          scan_code: taskJson.scan_code,
          duration: taskJson.duration,
          asset_id: taskJson.asset_id,
          role_id: taskJson.role_id,
          is_all_times: taskJson.is_all_times,
          task_group_id: taskJson.task_group_id,
          created_by: taskJson.created_by,
          parent_task_ids: taskJson.parent_task_ids || []
        };
        
        // Extract only needed fields from associations to avoid circular references
        if (taskJson.createdBy) {
          cleanedTask.createdBy = {
            id: taskJson.createdBy.id,
            name: taskJson.createdBy.name,
            email: taskJson.createdBy.email
          };
        }
        if (taskJson.role) {
          cleanedTask.role = {
            id: taskJson.role.id,
            name: taskJson.role.name,
            level: taskJson.role.level
          };
        }
        if (taskJson.asset) {
          cleanedTask.asset = {
            id: taskJson.asset.id,
            name: taskJson.asset.name,
            code: taskJson.asset.code
          };
        }
        
        return cleanedTask;
      });
      return result;
    } catch (error) {
      ctx.log?.error(
        { id, data, error: error.message, errorStack: error.stack },
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
