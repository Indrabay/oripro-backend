const { Op } = require("sequelize");

class TaskGroupRepository {
  constructor(taskGroupModel) {
    this.taskGroupModel = taskGroupModel;
  }

  async create(data, ctx = {}, tx = null) {
    try {
      ctx.log?.info(data, 'TaskGroupRepository.create');
      const taskGroup = await this.taskGroupModel.create({
        name: data.name,
        description: data.description,
        start_time: data.start_time,
        end_time: data.end_time,
        is_active: data.is_active !== undefined ? data.is_active : true,
        created_by: data.created_by || ctx.userId,
      }, { transaction: tx });
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
      return taskGroup ? taskGroup.toJSON() : null;
    } catch (error) {
      ctx.log?.error({ id, error }, 'TaskGroupRepository.findById_error');
      throw error;
    }
  }

  async findAll(filter = {}, ctx = {}) {
    try {
      ctx.log?.info({ filter }, 'TaskGroupRepository.findAll');
      const whereClause = {};
      
      if (filter.is_active !== undefined) {
        whereClause.is_active = filter.is_active;
      }

      const taskGroups = await this.taskGroupModel.findAll({
        where: whereClause,
        order: [['start_time', 'ASC']],
      });

      return taskGroups.map(tg => tg.toJSON());
    } catch (error) {
      ctx.log?.error({ filter, error }, 'TaskGroupRepository.findAll_error');
      throw error;
    }
  }

  /**
   * Find task groups that match the given time
   * @param {string} currentTime - Time in HH:mm format (e.g., "06:30")
   * @param {object} ctx - Context object
   * @returns {Promise<Array>} Array of matching task groups
   */
  async findByTime(currentTime, ctx = {}) {
    try {
      ctx.log?.info({ currentTime }, 'TaskGroupRepository.findByTime');
      
      // Convert time string to minutes for comparison
      const [hours, minutes] = currentTime.split(':').map(Number);
      const currentMinutes = hours * 60 + minutes;

      const taskGroups = await this.taskGroupModel.findAll({
        where: {
          is_active: true,
        },
      });

      // Filter task groups where current time is within start_time and end_time
      const matchingGroups = taskGroups.filter(tg => {
        const tgJson = tg.toJSON();
        const [startH, startM] = tgJson.start_time.split(':').map(Number);
        const [endH, endM] = tgJson.end_time.split(':').map(Number);
        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;

        // Handle time ranges that span midnight (e.g., 22:00 to 06:00)
        if (endMinutes < startMinutes) {
          // Range spans midnight
          return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
        } else {
          // Normal range within same day
          return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
        }
      });

      return matchingGroups.map(tg => tg.toJSON());
    } catch (error) {
      ctx.log?.error({ currentTime, error }, 'TaskGroupRepository.findByTime_error');
      throw error;
    }
  }

  async update(id, data, ctx = {}, tx = null) {
    try {
      ctx.log?.info({ id, data }, 'TaskGroupRepository.update');
      const updateData = {
        ...data,
        updated_by: ctx.userId,
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

