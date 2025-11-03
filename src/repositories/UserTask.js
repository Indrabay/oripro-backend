const { Op } = require("sequelize");
const moment = require("moment-timezone");
const { UserTaskStatusStrToInt, UserTaskStatusIntToStr } = require("../models/UserTask");

class UserTaskRepository {
  constructor(userTaskModel, userModel, taskModel, userTaskEvidenceModel, taskScheduleModel, taskGroupModel) {
    this.userTaskModel = userTaskModel;
    this.userModel = userModel;
    this.taskModel = taskModel;
    this.userTaskEvidenceModel = userTaskEvidenceModel;
    this.taskScheduleModel = taskScheduleModel;
    this.taskGroupModel = taskGroupModel;
  }

  async create(data, ctx = {}, tx = null) {
    try {
      ctx.log?.info(data, 'UserTaskRepository.create');
      const statusStr = data.status || 'pending';
      const statusInt = UserTaskStatusStrToInt[statusStr] !== undefined 
        ? UserTaskStatusStrToInt[statusStr] 
        : UserTaskStatusStrToInt['pending'];
      const userTask = await this.userTaskModel.create({
        task_id: data.task_id,
        user_id: data.user_id,
        start_at: data.start_at,
        completed_at: data.completed_at,
        notes: data.notes,
        status: statusInt,
      }, { transaction: tx });
      const userTaskJson = userTask.toJSON();
      // Convert status from integer to string for response
      userTaskJson.status = UserTaskStatusIntToStr[userTaskJson.status] || 'pending';
      return userTaskJson;
    } catch (error) {
      ctx.log?.error({ data, error }, 'UserTaskRepository.create_error');
      throw error;
    }
  }

  async findById(id, ctx = {}) {
    try {
      ctx.log?.info({ id }, 'UserTaskRepository.findById');
      const userTask = await this.userTaskModel.findByPk(id, {
        include: [
          {
            model: this.userModel,
            as: 'user',
            attributes: ['id', 'name', 'email']
          },
          {
            model: this.taskModel,
            as: 'task',
            attributes: ['id', 'name', 'duration', 'is_scan', 'scan_code']
          },
          {
            model: this.userTaskEvidenceModel,
            as: 'evidences',
            attributes: ['id', 'evidence_type', 'file_path', 'file_name', 'description', 'created_at']
          }
        ]
      });
      if (!userTask) return null;
      const userTaskJson = userTask.toJSON();
      // Convert status from integer to string for response
      if (userTaskJson.status !== undefined) {
        userTaskJson.status = UserTaskStatusIntToStr[userTaskJson.status] || 'pending';
      }
      return userTaskJson;
    } catch (error) {
      ctx.log?.error({ id, error }, 'UserTaskRepository.findById_error');
      throw error;
    }
  }

  async findByUserId(userId, queryParams = {}, ctx = {}) {
    try {
      ctx.log?.info({ userId, queryParams }, 'UserTaskRepository.findByUserId');
      const { limit = 10, offset = 0 } = queryParams;
      
      const whereClause = { user_id: userId };

      const { rows, count } = await this.userTaskModel.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']],
        include: [
          {
            model: this.taskModel,
            as: 'task',
            attributes: ['id', 'name', 'duration', 'is_scan', 'scan_code']
          },
          {
            model: this.userTaskEvidenceModel,
            as: 'evidences',
            attributes: ['id', 'evidence_type', 'file_path', 'file_name', 'description', 'created_at']
          }
        ]
      });

      return {
        userTasks: rows.map(ut => {
          const utJson = ut.toJSON();
          // Convert status from integer to string for response
          if (utJson.status !== undefined) {
            utJson.status = UserTaskStatusIntToStr[utJson.status] || 'pending';
          }
          return utJson;
        }),
        total: count,
        limit: parseInt(limit),
        offset: parseInt(offset),
      };
    } catch (error) {
      ctx.log?.error({ userId, queryParams, error }, 'UserTaskRepository.findByUserId_error');
      throw error;
    }
  }

  async getUpcomingTasks(userId, hoursAhead = 12, ctx = {}) {
    try {
      ctx.log?.info({ userId, hoursAhead }, 'UserTaskRepository.getUpcomingTasks');
      
      const now = moment().tz('Asia/Jakarta');
      const endTime = now.clone().add(hoursAhead, 'hours');
      
      const userTasks = await this.userTaskModel.findAll({
        where: {
          user_id: userId,
          status: UserTaskStatusStrToInt['pending'], // Not started yet
          start_at: null, // Not started yet
          completed_at: null, // Not completed yet
          created_at: {
            [Op.between]: [now.toDate(), endTime.toDate()]
          }
        },
        order: [['created_at', 'ASC']],
        include: [
          {
            model: this.taskModel,
            as: 'task',
            attributes: ['id', 'name', 'duration', 'is_scan', 'scan_code', 'is_need_validation']
          },
          {
            model: this.userTaskEvidenceModel,
            as: 'evidences',
            attributes: ['id', 'evidence_type', 'file_path', 'file_name', 'description', 'created_at']
          }
        ]
      });

      return userTasks.map(ut => {
        const utJson = ut.toJSON();
        // Convert status from integer to string for response
        if (utJson.status !== undefined) {
          utJson.status = UserTaskStatusIntToStr[utJson.status] || 'pending';
        }
        return utJson;
      });
    } catch (error) {
      ctx.log?.error({ userId, hoursAhead, error }, 'UserTaskRepository.getUpcomingTasks_error');
      throw error;
    }
  }

  async update(id, data, ctx = {}, tx = null) {
    try {
      ctx.log?.info({ id, data }, 'UserTaskRepository.update');
      const now = moment().tz('Asia/Jakarta').toDate();
      const updateData = {
        ...data,
        updated_at: now,
      };
      // Convert status from string to integer if provided
      if (updateData.status && typeof updateData.status === 'string') {
        updateData.status = UserTaskStatusStrToInt[updateData.status] !== undefined 
          ? UserTaskStatusStrToInt[updateData.status] 
          : UserTaskStatusStrToInt['pending'];
      }
      await this.userTaskModel.update(updateData, {
        where: { id },
        transaction: tx
      });
      const userTask = await this.findById(id, ctx);
      return userTask;
    } catch (error) {
      ctx.log?.error({ id, data, error }, 'UserTaskRepository.update_error');
      throw error;
    }
  }

  async startTask(id, ctx = {}, tx = null) {
    try {
      ctx.log?.info({ id }, 'UserTaskRepository.startTask');
      const now = moment().tz('Asia/Jakarta').toDate();
      await this.userTaskModel.update({
        start_at: now,
        status: UserTaskStatusStrToInt['inprogress'],
        updated_at: now,
      }, {
        where: { id },
        transaction: tx
      });
      const userTask = await this.findById(id, ctx);
      return userTask;
    } catch (error) {
      ctx.log?.error({ id, error }, 'UserTaskRepository.startTask_error');
      throw error;
    }
  }

  async completeTask(id, notes = null, ctx = {}, tx = null) {
    try {
      ctx.log?.info({ id, notes }, 'UserTaskRepository.completeTask');
      const now = moment().tz('Asia/Jakarta').toDate();
      const updateData = {
        completed_at: now,
        status: UserTaskStatusStrToInt['completed'],
        updated_at: now,
      };
      if (notes) {
        updateData.notes = notes;
      }
      await this.userTaskModel.update(updateData, {
        where: { id },
        transaction: tx
      });
      const userTask = await this.findById(id, ctx);
      return userTask;
    } catch (error) {
      ctx.log?.error({ id, notes, error }, 'UserTaskRepository.completeTask_error');
      throw error;
    }
  }

  async delete(id, ctx = {}, tx = null) {
    try {
      ctx.log?.info({ id }, 'UserTaskRepository.delete');
      await this.userTaskModel.destroy({
        where: { id },
        transaction: tx
      });
      return true;
    } catch (error) {
      ctx.log?.error({ id, error }, 'UserTaskRepository.delete_error');
      throw error;
    }
  }

  async findCompletedByUserAndDateRange(userId, startDate, endDate, queryParams = {}, ctx = {}) {
    try {
      ctx.log?.info({ userId, startDate, endDate, queryParams }, 'UserTaskRepository.findCompletedByUserAndDateRange');
      const { limit = 10, offset = 0 } = queryParams;
      
      const whereClause = {
        user_id: userId,
        status: UserTaskStatusStrToInt['completed'],
      };

      // Filter by completed_at date range
      if (startDate || endDate) {
        whereClause.completed_at = {};
        if (startDate) {
          // Start of day for start date
          const start = moment(startDate).tz('Asia/Jakarta').startOf('day').toDate();
          whereClause.completed_at[Op.gte] = start;
        }
        if (endDate) {
          // End of day for end date
          const end = moment(endDate).tz('Asia/Jakarta').endOf('day').toDate();
          whereClause.completed_at[Op.lte] = end;
        }
      } else {
        // If no date range provided, require completed_at to not be null
        whereClause.completed_at = { [Op.ne]: null };
      }

      const { rows, count } = await this.userTaskModel.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['completed_at', 'DESC']],
        include: [
          {
            model: this.taskModel,
            as: 'task',
            attributes: ['id', 'name', 'duration', 'is_scan', 'scan_code']
          },
          {
            model: this.userTaskEvidenceModel,
            as: 'evidences',
            attributes: ['id', 'evidence_type', 'file_path', 'file_name', 'description', 'created_at']
          }
        ]
      });

      // Calculate completion percentage
      const completionStats = await this.getCompletionPercentage(userId, startDate, endDate, ctx);

      return {
        userTasks: rows.map(ut => {
          const utJson = ut.toJSON();
          // Convert status from integer to string for response
          if (utJson.status !== undefined) {
            utJson.status = UserTaskStatusIntToStr[utJson.status] || 'pending';
          }
          return utJson;
        }),
        total: count,
        limit: parseInt(limit),
        offset: parseInt(offset),
        statistics: completionStats,
      };
    } catch (error) {
      ctx.log?.error({ userId, startDate, endDate, queryParams, error }, 'UserTaskRepository.findCompletedByUserAndDateRange_error');
      throw error;
    }
  }

  async getCompletionPercentage(userId, startDate, endDate, ctx = {}) {
    try {
      ctx.log?.info({ userId, startDate, endDate }, 'UserTaskRepository.getCompletionPercentage');
      
      // Build where clause for total tasks (based on created_at if date range provided)
      const totalWhereClause = { user_id: userId };
      
      // If date range provided, count tasks created in that range
      // Otherwise, count all tasks for the user
      if (startDate || endDate) {
        totalWhereClause.created_at = {};
        if (startDate) {
          const start = moment(startDate).tz('Asia/Jakarta').startOf('day').toDate();
          totalWhereClause.created_at[Op.gte] = start;
        }
        if (endDate) {
          const end = moment(endDate).tz('Asia/Jakarta').endOf('day').toDate();
          totalWhereClause.created_at[Op.lte] = end;
        }
      }

      // Count total tasks
      const totalTasks = await this.userTaskModel.count({
        where: totalWhereClause
      });

      // Build where clause for completed tasks
      const completedWhereClause = {
        user_id: userId,
        status: UserTaskStatusStrToInt['completed'],
      };

      // Filter by completed_at date range
      if (startDate || endDate) {
        completedWhereClause.completed_at = {};
        if (startDate) {
          const start = moment(startDate).tz('Asia/Jakarta').startOf('day').toDate();
          completedWhereClause.completed_at[Op.gte] = start;
        }
        if (endDate) {
          const end = moment(endDate).tz('Asia/Jakarta').endOf('day').toDate();
          completedWhereClause.completed_at[Op.lte] = end;
        }
      } else {
        completedWhereClause.completed_at = { [Op.ne]: null };
      }

      // Count completed tasks
      const completedTasks = await this.userTaskModel.count({
        where: completedWhereClause
      });

      // Calculate percentage
      const percentage = totalTasks > 0 
        ? Math.round((completedTasks / totalTasks) * 100 * 100) / 100 // Round to 2 decimal places
        : 0;

      return {
        total_tasks: totalTasks,
        completed_tasks: completedTasks,
        pending_tasks: totalTasks - completedTasks,
        completion_percentage: percentage,
      };
    } catch (error) {
      ctx.log?.error({ userId, startDate, endDate, error }, 'UserTaskRepository.getCompletionPercentage_error');
      throw error;
    }
  }

  async generateUpcomingUserTasks(userId, hoursAhead = 12, ctx = {}) {
    try {
      ctx.log?.info({ userId, hoursAhead }, 'UserTaskRepository.generateUpcomingUserTasks');
      
      const sequelize = require('../models/sequelize');
      const result = await sequelize.transaction(async (t) => {
        // Get current day and time in Asia/Jakarta timezone
        const now = moment().tz('Asia/Jakarta');
        const currentDay = now.day(); // 0 = Sunday, 1 = Monday, etc.
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const currentDayName = dayNames[currentDay];
        const currentTime = now.format('HH:mm');
        
        // Find task groups that match the current time
        const allTaskGroups = await this.taskGroupModel.findAll({
          where: {
            is_active: true,
          },
        });

        // Filter task groups where current time is within start_time and end_time
        const matchingTaskGroups = allTaskGroups.filter(tg => {
          const tgJson = tg.toJSON();
          const [startH, startM] = tgJson.start_time.split(':').map(Number);
          const [endH, endM] = tgJson.end_time.split(':').map(Number);
          const [currentH, currentM] = currentTime.split(':').map(Number);
          
          const startMinutes = startH * 60 + startM;
          const endMinutes = endH * 60 + endM;
          const currentMinutes = currentH * 60 + currentM;

          // Handle time ranges that span midnight (e.g., 22:00 to 06:00)
          if (endMinutes < startMinutes) {
            // Range spans midnight
            return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
          } else {
            // Normal range within same day
            return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
          }
        });

        const matchingTaskGroupIds = matchingTaskGroups.map(tg => tg.id);
        
        // Build where clause for tasks
        const taskWhereClause = {};
        if (matchingTaskGroupIds.length > 0) {
          // Only get tasks that belong to matching task groups
          taskWhereClause[Op.or] = [
            { task_group_id: { [Op.in]: matchingTaskGroupIds } },
            { task_group_id: null } // Also include tasks without a task group
          ];
        } else {
          // If no matching task groups, only get tasks without a task group
          taskWhereClause.task_group_id = null;
        }
        
        // Get all tasks with their schedules for today, filtered by task group
        const tasks = await this.taskModel.findAll({
          where: taskWhereClause,
          include: [
            {
              model: this.taskScheduleModel,
              as: 'schedules',
              where: {
                [Op.or]: [
                  { day_of_week: 'all' },
                  { day_of_week: currentDayName }
                ]
              },
              required: true
            }
          ]
        });

        const createdUserTasks = [];
        
        // Create user tasks for each scheduled task
        for (const task of tasks) {
          for (const schedule of task.schedules) {
            // Create user task for each schedule (allow multiple instances)
            const userTaskData = {
              task_id: task.id,
              user_id: userId,
              start_at: null,
              completed_at: null,
              notes: null,
              status: 'pending'
            };

            const userTask = await this.create(userTaskData, ctx, t);
            createdUserTasks.push(userTask);
          }
        }

        return {
          created: createdUserTasks.length,
          userTasks: createdUserTasks
        };
      });

      return result;
    } catch (error) {
      ctx.log?.error({ userId, hoursAhead, error }, 'UserTaskRepository.generateUpcomingUserTasks_error');
      throw error;
    }
  }
}

module.exports = UserTaskRepository;
