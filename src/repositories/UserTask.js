const { Op } = require("sequelize");
const moment = require("moment-timezone");

class UserTaskRepository {
  constructor(userTaskModel, userModel, taskModel, userTaskEvidenceModel, taskScheduleModel) {
    this.userTaskModel = userTaskModel;
    this.userModel = userModel;
    this.taskModel = taskModel;
    this.userTaskEvidenceModel = userTaskEvidenceModel;
    this.taskScheduleModel = taskScheduleModel;
  }

  async create(data, ctx = {}, tx = null) {
    try {
      ctx.log?.info(data, 'UserTaskRepository.create');
      const userTask = await this.userTaskModel.create({
        task_id: data.task_id,
        user_id: data.user_id,
        start_at: data.start_at,
        completed_at: data.completed_at,
        notes: data.notes,
      }, { transaction: tx });
      return userTask.toJSON();
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
      return userTask;
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
        userTasks: rows.map(ut => ut.toJSON()),
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

      return userTasks.map(ut => ut.toJSON());
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
        
        // Calculate 12 hours from now in Asia/Jakarta timezone
        const twelveHoursFromNow = now.clone().add(hoursAhead, 'hours');
        const endTime = twelveHoursFromNow.format('HH:mm');
        
        // Get all tasks with their schedules for today
        const tasks = await this.taskModel.findAll({
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
              notes: null
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
