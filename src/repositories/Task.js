class TaskRepository {
  constructor(taskModel, userModel, roleModel, assetModel, taskGroupModel, taskParentModel) {
    this.taskModel = taskModel;
    this.userModel = userModel;
    this.roleModel = roleModel;
    this.assetModel = assetModel;
    this.taskGroupModel = taskGroupModel;
    this.taskParentModel = taskParentModel;
  }

  async create(transaction = null, data, ctx) {
    try {
      ctx.log?.info(data, "TaskRepository.create");
      const task = await this.taskModel.create(data, { transaction });
      return task;
    } catch (error) {
      ctx.log?.error({ data, error}, "TaskRepository.create_error");
      throw error;
    }
  }

  async findById(id, ctx) {
    try {
      ctx.log?.info({ id }, "TaskRepository.findById");
      const task = await this.taskModel.findByPk(id, {
        include: [
          {
            model: this.userModel,
            as: 'createdBy',
            attributes: ['id', 'name', 'email']
          },
          {
            model: this.roleModel,
            as: 'role',
            attributes: ['id', 'name', 'level']
          },
          {
            model: this.assetModel,
            as: 'asset',
            attributes: ['id', 'name', 'code']
          },
          {
            model: this.taskGroupModel,
            as: 'taskGroup',
            attributes: ['id', 'name', 'start_time', 'end_time', 'is_active'],
            required: false
          },
        ]
      });
      
      
      return task;
    } catch (error) {
      ctx.log?.error({ id, error }, "TaskRepository.findById_error");
      throw error;
    }
  }

  async update(id, data, ctx, transaction = null) {
    try {
      ctx.log?.info({ id, data }, "TaskRepository.update");
      await this.taskModel.update(data, {
        where: { id },
        transaction
      });
      const task = await this.findById(id, ctx);
      return task;
    } catch (error) {
      ctx.log?.error({ id, data, error }, "TaskRepository.update_error");
      throw error;
    }
  }

  async findAll(filters = {}, ctx = {}) {
    try {
      ctx.log?.info({ filters }, "TaskRepository.findAll");
      const { Op } = require('sequelize');
      
      const whereClause = {};
      
      // Add filters if provided
      if (filters.task_group_id) {
        whereClause.task_group_id = filters.task_group_id;
      }
      if (filters.is_main_task !== undefined) {
        whereClause.is_main_task = filters.is_main_task;
      }
      if (filters.role_id) {
        whereClause.role_id = filters.role_id;
      }
      if (filters.asset_id) {
        whereClause.asset_id = filters.asset_id;
      }
      if (filters.name) {
        whereClause.name = {
          [Op.iLike]: `%${filters.name}%`
        };
      }

      const queryOptions = {
        where: whereClause,
        include: [
          {
            model: this.userModel,
            as: 'createdBy',
            attributes: ['id', 'name', 'email']
          },
          {
            model: this.roleModel,
            as: 'role',
            attributes: ['id', 'name', 'level']
          },
          {
            model: this.assetModel,
            as: 'asset',
            attributes: ['id', 'name', 'code']
          },
          {
            model: this.taskGroupModel,
            as: 'taskGroup',
            attributes: ['id', 'name', 'start_time', 'end_time', 'is_active'],
            required: false
          }
        ],
        order: [['id', 'ASC']]
      };

      // Add pagination if provided
      if (filters.limit) {
        queryOptions.limit = parseInt(filters.limit);
      }
      if (filters.offset) {
        queryOptions.offset = parseInt(filters.offset);
      }

      const { count, rows } = await this.taskModel.findAndCountAll(queryOptions);
      
      // Get parent task IDs for each task
      const tasks = await Promise.all(rows.map(async (task) => {
        const taskJson = task.toJSON ? task.toJSON() : task;
        
        // Get parent task IDs from junction table
        if (this.taskParentModel) {
          const parentRelations = await this.taskParentModel.findAll({
            where: { child_task_id: task.id },
            attributes: ['parent_task_id']
          });
          taskJson.parent_task_ids = parentRelations.map(rel => rel.parent_task_id);
        } else {
          taskJson.parent_task_ids = [];
        }
        
        return taskJson;
      }));

      return {
        tasks,
        total: count
      };
    } catch (error) {
      ctx.log?.error({ filters, error }, "TaskRepository.findAll_error");
      throw error;
    }
  }

  async delete(id, ctx = {}, transaction = null) {
    try {
      ctx.log?.info({ id }, "TaskRepository.delete");
      const deleted = await this.taskModel.destroy({
        where: { id },
        transaction
      });
      return deleted > 0;
    } catch (error) {
      ctx.log?.error({ id, error }, "TaskRepository.delete_error");
      throw error;
    }
  }
  
  // async getNearestTask(ctx) {
  //   try {
  //     ctx.log?.info()
  //   } catch (error) {
      
  //   }
  // }
}

module.exports = TaskRepository;