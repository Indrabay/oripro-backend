const sequelize = require("../models/sequelize");

class UserTaskUsecase {
  constructor(userTaskRepository, taskRepository, taskScheduleRepository, userTaskEvidenceRepository) {
    this.userTaskRepository = userTaskRepository;
    this.taskRepository = taskRepository;
    this.taskScheduleRepository = taskScheduleRepository;
    this.userTaskEvidenceRepository = userTaskEvidenceRepository;
  }

  async generateUpcomingUserTasks(ctx) {
    try {
      ctx.log?.info({}, "UserTaskUsecase.generateUpcomingUserTasks");
      
      const result = await this.userTaskRepository.generateUpcomingUserTasks(ctx.userId, 12, ctx);
      return result;
    } catch (error) {
      ctx.log?.error(
        { error: error.message },
        "UserTaskUsecase.generateUpcomingUserTasks_error"
      );
      // Re-throw with custom error for already generated tasks
      if (error.message.includes('already been generated')) {
        const customError = new Error(error.message);
        customError.statusCode = 409; // Conflict
        throw customError;
      }
      throw error;
    }
  }

  async getUserTaskByCode(code, ctx) {
    try {
      ctx.log?.info({ code }, "UserTaskUsecase.getUserTaskByCode");
      const userTask = await this.userTaskRepository.findByCode(code, ctx);
      return userTask;
    } catch (error) {
      ctx.log?.error(
        { code, error: error.message },
        "UserTaskUsecase.getUserTaskByCode_error"
      );
      throw error;
    }
  }

  async getUserTasks(userId, queryParams, ctx) {
    try {
      ctx.log?.info({ userId, queryParams }, "UserTaskUsecase.getUserTasks");
      const result = await this.userTaskRepository.findByUserId(userId, queryParams, ctx);
      return result;
    } catch (error) {
      ctx.log?.error(
        { userId, queryParams, error: error.message },
        "UserTaskUsecase.getUserTasks_error"
      );
      throw error;
    }
  }

  async getUpcomingUserTasks(userId, ctx) {
    try {
      ctx.log?.info({ userId }, "UserTaskUsecase.getUpcomingUserTasks");
      const userTasks = await this.userTaskRepository.getUpcomingTasks(userId, 12, ctx);
      return userTasks;
    } catch (error) {
      ctx.log?.error(
        { userId, error: error.message },
        "UserTaskUsecase.getUpcomingUserTasks_error"
      );
      throw error;
    }
  }

  async startUserTask(userTaskId, ctx) {
    try {
      ctx.log?.info({ userTaskId }, "UserTaskUsecase.startUserTask");
      
      // Check if user task exists and belongs to the user
      const userTask = await this.userTaskRepository.findById(userTaskId, ctx);
      if (!userTask || userTask.user_id !== ctx.userId) {
        return null;
      }

      if (userTask.start_at !== null) {
        throw new Error('Task has already been started');
      }

      if (userTask.completed_at !== null) {
        throw new Error('Task has already been completed');
      }

      const result = await this.userTaskRepository.startTask(userTaskId, ctx);
      return result;
    } catch (error) {
      ctx.log?.error(
        { userTaskId, error: error.message },
        "UserTaskUsecase.startUserTask_error"
      );
      throw error;
    }
  }

  async completeUserTask(userTaskId, data, ctx) {
    try {
      ctx.log?.info({ userTaskId, data }, "UserTaskUsecase.completeUserTask");
      
      // Check if user task exists and belongs to the user
      const userTask = await this.userTaskRepository.findById(userTaskId, ctx);
      if (!userTask || userTask.user_id !== ctx.userId) {
        return null;
      }

      if (userTask.start_at === null) {
        throw new Error('Task must be started before it can be completed');
      }

      if (userTask.completed_at !== null) {
        throw new Error('Task has already been completed');
      }

      // Use transaction to ensure both task completion and evidence saving happen atomically
      const result = await sequelize.transaction(async (t) => {
        // Complete the task
        const completedTask = await this.userTaskRepository.completeTask(userTaskId, data.notes, ctx, t);
        
        // Save evidence URLs if provided
        if (data.evidence) {
          // Handle both array and single URL string
          const urlArray = Array.isArray(data.evidence) ? data.evidence : [data.evidence];
          
          for (const url of urlArray) {
            if (url && typeof url === 'string') {
              await this.userTaskEvidenceRepository.create({
                user_task_id: userTaskId,
                url: url,
              }, ctx, t);
            }
          }
        }
        
        return completedTask;
      });
      
      return result;
    } catch (error) {
      ctx.log?.error(
        { userTaskId, data, error: error.message, errorStack: error.stack },
        "UserTaskUsecase.completeUserTask_error"
      );
      throw error;
    }
  }
}

module.exports = UserTaskUsecase;
