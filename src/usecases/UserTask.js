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

      const result = await this.userTaskRepository.completeTask(userTaskId, data.notes, ctx);
      return result;
    } catch (error) {
      ctx.log?.error(
        { userTaskId, data, error: error.message },
        "UserTaskUsecase.completeUserTask_error"
      );
      throw error;
    }
  }

  async getCompletedTasks(userId, queryParams, ctx) {
    try {
      ctx.log?.info({ userId, queryParams }, "UserTaskUsecase.getCompletedTasks");
      
      const { start_date, end_date, limit, offset } = queryParams;
      
      // Validate date format if provided
      if (start_date && !this.isValidDate(start_date)) {
        throw new Error('Invalid start_date format. Use YYYY-MM-DD');
      }
      if (end_date && !this.isValidDate(end_date)) {
        throw new Error('Invalid end_date format. Use YYYY-MM-DD');
      }
      
      // Validate date range
      if (start_date && end_date) {
        const start = new Date(start_date);
        const end = new Date(end_date);
        if (start > end) {
          throw new Error('start_date must be before or equal to end_date');
        }
      }
      
      const result = await this.userTaskRepository.findCompletedByUserAndDateRange(
        userId,
        start_date,
        end_date,
        { limit, offset },
        ctx
      );
      return result;
    } catch (error) {
      ctx.log?.error(
        { userId, queryParams, error: error.message },
        "UserTaskUsecase.getCompletedTasks_error"
      );
      throw error;
    }
  }

  isValidDate(dateString) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) {
      return false;
    }
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  }
}

module.exports = UserTaskUsecase;
