const { UserTaskStatusIntToStr } = require('../models/UserTask');

class TaskGroupRepository {
  constructor(taskGroupModel, taskModel, userTaskModel, taskParentModel, userModel) {
    this.taskGroupModel = taskGroupModel;
    this.taskModel = taskModel;
    this.userTaskModel = userTaskModel;
    this.taskParentModel = taskParentModel;
    this.userModel = userModel;
  }

  async create(data, ctx = {}, tx = null) {
    try {
      ctx.log?.info(data, 'TaskGroupRepository.create');
      const taskGroup = await this.taskGroupModel.create(data, { transaction: tx });
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
      if (!taskGroup) return null;
      return taskGroup.toJSON();
    } catch (error) {
      ctx.log?.error({ id, error }, 'TaskGroupRepository.findById_error');
      throw error;
    }
  }

  async findAll(filter = {}, ctx = {}) {
    try {
      ctx.log?.info({ filter }, 'TaskGroupRepository.findAll');
      const taskGroups = await this.taskGroupModel.findAll({
        where: filter,
        order: [['created_at', 'DESC']],
      });
      return taskGroups.map(tg => tg.toJSON());
    } catch (error) {
      ctx.log?.error({ filter, error }, 'TaskGroupRepository.findAll_error');
      throw error;
    }
  }

  async update(id, data, ctx = {}, tx = null) {
    try {
      ctx.log?.info({ id, data }, 'TaskGroupRepository.update');
      const updateData = {
        ...data,
        updated_at: new Date(),
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

  async findWithTasksAndUserTasks(userId, ctx = {}) {
    try {
      ctx.log?.info({ userId }, 'TaskGroupRepository.findWithTasksAndUserTasks');
      
      // Get all task groups
      const taskGroups = await this.taskGroupModel.findAll({
        where: { is_active: true },
        order: [['created_at', 'DESC']],
      });

      const result = await Promise.all(taskGroups.map(async (tg) => {
        const tgJson = tg.toJSON();
        
        // Get all tasks in this task group
        const tasks = await this.taskModel.findAll({
          where: { task_group_id: tgJson.id },
          include: [
            {
              model: this.taskParentModel,
              as: 'parentRelations',
              attributes: ['parent_task_id'],
            },
            {
              model: this.taskParentModel,
              as: 'childRelations',
              attributes: ['child_task_id'],
            },
          ],
        });

        // Organize tasks into parent and child structure
        const taskMap = new Map();
        const parentTasks = [];
        const childTasks = [];

        // First pass: create task map and identify which tasks have parents
        tasks.forEach(task => {
          const taskJson = task.toJSON();
          const parentTaskIds = taskJson.parentRelations?.map(r => r.parent_task_id) || [];
          
          taskMap.set(taskJson.id, {
            ...taskJson,
            parent_task_ids: parentTaskIds,
            // Remove relations from the task object
            parentRelations: undefined,
            childRelations: undefined,
          });
        });

        // Get all parent task IDs from this task group
        const parentTaskIds = [];
        taskMap.forEach((task, taskId) => {
          if (task.parent_task_ids.length === 0) {
            // This is a parent task (no parent)
            parentTasks.push(task);
            parentTaskIds.push(taskId);
          } else {
            // This is a child task (has parent)
            childTasks.push(task);
          }
        });

        // Find child tasks from OTHER task groups that have these parent tasks as parents
        let allChildTasks = [...childTasks];
        if (parentTaskIds.length > 0 && this.taskParentModel) {
          const parentRelations = await this.taskParentModel.findAll({
            where: { parent_task_id: parentTaskIds },
            attributes: ['child_task_id', 'parent_task_id'],
          });

          const childTaskIdsFromOtherGroups = [...new Set(parentRelations.map(rel => rel.child_task_id))];
          
          // Get child tasks that are not already in our task group
          const existingChildTaskIds = childTasks.map(ct => ct.id);
          const newChildTaskIds = childTaskIdsFromOtherGroups.filter(id => !existingChildTaskIds.includes(id));
          
          if (newChildTaskIds.length > 0) {
            const childTasksFromOtherGroups = await this.taskModel.findAll({
              where: { id: newChildTaskIds },
              include: [
                {
                  model: this.taskParentModel,
                  as: 'parentRelations',
                  attributes: ['parent_task_id'],
                },
              ],
            });

            childTasksFromOtherGroups.forEach(childTask => {
              const childTaskJson = childTask.toJSON();
              const parentTaskIdsForChild = childTaskJson.parentRelations?.map(r => r.parent_task_id) || [];
              allChildTasks.push({
                ...childTaskJson,
                parent_task_ids: parentTaskIdsForChild,
                parentRelations: undefined,
              });
            });
          }
        }

        // Get all task IDs (parent + child tasks) to load user tasks
        const allTaskIds = [
          ...parentTasks.map(pt => pt.id),
          ...allChildTasks.map(ct => ct.id)
        ];
        
        ctx.log?.info({ 
          userId, 
          taskGroupId: tgJson.id, 
          taskGroupName: tgJson.name,
          parentTaskIds: parentTasks.map(pt => pt.id),
          childTaskIds: allChildTasks.map(ct => ct.id),
          allTaskIds 
        }, 'TaskGroupRepository.findWithTasksAndUserTasks - Loading user tasks');
        
        // Load user tasks for all tasks (parent + child)
        const userTasks = await this.userTaskModel.findAll({
          where: { 
            user_id: userId,
            task_id: allTaskIds.length > 0 ? allTaskIds : [-1] // Use -1 to return no results if no tasks
          },
          include: [
            {
              model: this.taskModel,
              as: 'task',
              attributes: ['id', 'name', 'duration', 'is_scan', 'scan_code', 'is_need_validation', 'is_main_task', 'task_group_id'],
              required: false // Don't require task - some user_tasks might not have matching tasks
            },
          ],
        });

        ctx.log?.info({ 
          userId, 
          taskGroupId: tgJson.id,
          userTasksFound: userTasks.length,
          userTasksData: userTasks.map(ut => {
            const utJson = ut.toJSON();
            return {
              id: utJson.id,
              task_id: utJson.task_id,
              taskName: utJson.task?.name,
              status: utJson.status,
              user_id: utJson.user_id
            };
          })
        }, 'TaskGroupRepository.findWithTasksAndUserTasks - User tasks loaded');

        // Map user tasks to their corresponding tasks
        const userTaskMap = new Map();
        userTasks.forEach(ut => {
          const utJson = ut.toJSON();
          const taskId = utJson.task_id || utJson.task?.id; // Try both task_id and task.id
          if (taskId) {
            // Ensure taskId is a number for consistent mapping
            const taskIdNum = typeof taskId === 'string' ? parseInt(taskId, 10) : taskId;
            if (!isNaN(taskIdNum)) {
              if (!userTaskMap.has(taskIdNum)) {
                userTaskMap.set(taskIdNum, []);
              }
              // Convert status from integer to string
              const statusInt = utJson.status !== undefined ? utJson.status : 0;
              const statusStr = UserTaskStatusIntToStr[statusInt] || 'pending';
              userTaskMap.get(taskIdNum).push({
                id: utJson.id,
                status: statusStr,
                start_at: utJson.start_at,
                completed_at: utJson.completed_at,
                notes: utJson.notes,
              });
            } else {
              ctx.log?.warn({ 
                userTaskId: utJson.id, 
                taskId,
                taskIdNum,
                userTaskData: utJson 
              }, 'TaskGroupRepository.findWithTasksAndUserTasks - Invalid task_id');
            }
          } else {
            ctx.log?.warn({ 
              userTaskId: utJson.id, 
              userTaskData: utJson 
            }, 'TaskGroupRepository.findWithTasksAndUserTasks - User task without task_id');
          }
        });

        ctx.log?.info({ 
          userId, 
          taskGroupId: tgJson.id,
          userTaskMapSize: userTaskMap.size,
          userTaskMapEntries: Array.from(userTaskMap.entries()).map(([taskId, tasks]) => ({
            taskId,
            taskIdType: typeof taskId,
            userTasksCount: tasks.length
          })),
          parentTaskIds: parentTasks.map(pt => ({ id: pt.id, idType: typeof pt.id }))
        }, 'TaskGroupRepository.findWithTasksAndUserTasks - User task map created');

        // Attach user tasks to parent tasks and attach child tasks to their parents
        const parentTasksWithUserTasks = parentTasks.map(pt => {
          // Ensure pt.id is a number for consistent mapping
          const ptIdNum = typeof pt.id === 'string' ? parseInt(pt.id, 10) : pt.id;
          const userTasksForTask = userTaskMap.get(ptIdNum) || [];
          
          ctx.log?.info({
            taskId: pt.id,
            taskIdNum: ptIdNum,
            taskName: pt.name,
            userTasksCount: userTasksForTask.length,
            userTasks: userTasksForTask
          }, 'TaskGroupRepository.findWithTasksAndUserTasks - Attaching user tasks to parent task');
          
          // Find child tasks that belong to this parent
          const childTasksForParent = allChildTasks.filter(ct => 
            ct.parent_task_ids && ct.parent_task_ids.includes(pt.id)
          );

          // Attach user tasks to child tasks
          const childTasksWithUserTasks = childTasksForParent.map(ct => {
            const ctIdNum = typeof ct.id === 'string' ? parseInt(ct.id, 10) : ct.id;
            const childUserTasks = userTaskMap.get(ctIdNum) || [];
            
            ctx.log?.info({
              childTaskId: ct.id,
              childTaskIdNum: ctIdNum,
              childTaskName: ct.name,
              userTasksCount: childUserTasks.length,
              userTasks: childUserTasks
            }, 'TaskGroupRepository.findWithTasksAndUserTasks - Attaching user tasks to child task');
            
            return {
              ...ct,
              user_tasks: childUserTasks,
            };
          });

          return {
            ...pt,
            user_tasks: userTasksForTask,
            child_tasks: childTasksWithUserTasks,
          };
        });

        // Attach user tasks to standalone child tasks (child tasks that don't belong to any parent in this group)
        const standaloneChildTasks = allChildTasks.filter(ct => {
          const hasParentInThisGroup = parentTasks.some(pt => 
            ct.parent_task_ids && ct.parent_task_ids.includes(pt.id)
          );
          return !hasParentInThisGroup;
        });

        const childTasksWithUserTasks = standaloneChildTasks.map(ct => ({
          ...ct,
          user_tasks: userTaskMap.get(ct.id) || [],
        }));

        return {
          ...tgJson,
          parent_tasks: parentTasksWithUserTasks,
          child_tasks: childTasksWithUserTasks,
        };
      }));

      return result;
    } catch (error) {
      ctx.log?.error({ userId, error }, 'TaskGroupRepository.findWithTasksAndUserTasks_error');
      throw error;
    }
  }
}

module.exports = TaskGroupRepository;

