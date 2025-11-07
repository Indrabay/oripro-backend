const { Op } = require("sequelize");
const moment = require("moment-timezone");
const { UserTaskStatusIntToStr, UserTaskStatusStrToInt } = require("../models/UserTask");

class UserTaskRepository {
  constructor(userTaskModel, userModel, taskModel, userTaskEvidenceModel, taskScheduleModel, taskGroupModel, taskParentModel) {
    this.userTaskModel = userTaskModel;
    this.userModel = userModel;
    this.taskModel = taskModel;
    this.userTaskEvidenceModel = userTaskEvidenceModel;
    this.taskScheduleModel = taskScheduleModel;
    this.taskGroupModel = taskGroupModel;
    this.taskParentModel = taskParentModel;
  }

  async create(data, ctx = {}, tx = null) {
    try {
      ctx.log?.info(data, 'UserTaskRepository.create');
      
      // Convert status from string to integer if provided
      let statusInt = 0; // default to pending
      if (data.status !== undefined) {
        if (typeof data.status === 'string') {
          statusInt = UserTaskStatusStrToInt[data.status] !== undefined 
            ? UserTaskStatusStrToInt[data.status] 
            : 0;
        } else if (typeof data.status === 'number') {
          statusInt = data.status;
        }
      }
      
      const userTask = await this.userTaskModel.create({
        task_id: data.task_id,
        user_id: data.user_id,
        start_at: data.start_at,
        completed_at: data.completed_at,
        notes: data.notes,
        status: statusInt,
        code: data.code || null,
        is_main_task: data.is_main_task !== undefined ? data.is_main_task : false,
        parent_user_task_id: data.parent_user_task_id || null,
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
      if (!userTask) return null;
      const userTaskJson = userTask.toJSON();
      // Convert status from integer to string for response
      if (userTaskJson.status !== undefined) {
        userTaskJson.status = UserTaskStatusIntToStr[userTaskJson.status] || 'pending';
      }
      return userTaskJson;
    } catch (error) {
      ctx.log?.error({ code, error }, 'UserTaskRepository.findByCode_error');
      throw error;
    }
  }

  async findByCode(code, ctx = {}) {
    try {
      ctx.log?.info({ code }, 'UserTaskRepository.findByCode');
      const userTask = await this.userTaskModel.findOne({
        where: { code },
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
      ctx.log?.error({ code, error }, 'UserTaskRepository.findByCode_error');
      throw error;
    }
  }

  async findByUserId(userId, queryParams = {}, ctx = {}) {
    try {
      ctx.log?.info({ userId, queryParams }, 'UserTaskRepository.findByUserId');
      const { limit = 10, offset = 0 } = queryParams;
      
      // Get current time in Asia/Jakarta timezone to filter by task group time range
      const now = moment().tz('Asia/Jakarta');
      const currentTime = now.format('HH:mm');
      
      // Find task groups that match the current time
      let matchingTaskGroupIds = [];
      if (this.taskGroupModel) {
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

        matchingTaskGroupIds = matchingTaskGroups.map(tg => tg.toJSON().id);
        
        // If taskGroupModel is available but no matching task groups found, return empty array
        if (matchingTaskGroupIds.length === 0) {
          return [];
        }
      }
      
      const whereClause = { user_id: userId };

      // Get all user tasks (both main and child) for the user
      // We'll filter by task_group later after we have the full data
      const { rows, count } = await this.userTaskModel.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit) * 10, // Increase limit to account for child tasks
        offset: parseInt(offset),
        order: [['created_at', 'DESC']],
        include: [
          {
            model: this.taskModel,
            as: 'task',
            // attributes: ['id', 'name', 'duration', 'is_scan', 'scan_code', 'is_main_task', 'task_group_id'],
            required: false // Don't require task - some user_tasks might not have matching tasks
          },
          {
            model: this.userTaskEvidenceModel,
            as: 'evidences',
            attributes: ['id', 'evidence_type', 'file_path', 'file_name', 'description', 'created_at']
          }
        ]
      });

      // Separate main tasks and child tasks
      const mainTasksRows = [];
      const childTasksRows = [];
      const allUserTaskIds = new Set();
      
      rows.forEach(ut => {
        const utJson = ut.toJSON();
        allUserTaskIds.add(utJson.id);
        
        if (utJson.is_main_task) {
          mainTasksRows.push(ut);
        } else if (utJson.parent_user_task_id) {
          childTasksRows.push(ut);
        } else {
          // Standalone task without parent or main flag, treat as main
          mainTasksRows.push(ut);
        }
      });

      // Filter main tasks by task_group
      const filteredMainTasks = matchingTaskGroupIds.length > 0
        ? mainTasksRows.filter(ut => {
            const utJson = ut.toJSON();
            const task = utJson.task;
            return task && task.task_group_id && matchingTaskGroupIds.includes(task.task_group_id);
          })
        : mainTasksRows;

      // Get IDs of filtered main tasks
      const filteredMainTaskIds = new Set(filteredMainTasks.map(ut => ut.toJSON().id));

      // Filter child tasks to only include those whose parents are in filteredMainTaskIds
      const filteredChildTasks = childTasksRows.filter(ut => {
        const utJson = ut.toJSON();
        return filteredMainTaskIds.has(utJson.parent_user_task_id);
      });

      // Combine filtered main tasks and their child tasks
      const allRows = [...filteredMainTasks, ...filteredChildTasks];

      // Process user tasks to group child tasks under main tasks
      const userTasksJson = allRows.map(ut => {
        const utJson = ut.toJSON();
        // Convert status from integer to string for response
        if (utJson.status !== undefined) {
          utJson.status = UserTaskStatusIntToStr[utJson.status] || 'pending';
        }
        return utJson;
      });

      // Filter to only keep user tasks from the newest generation (code)
      // Group by code and find the newest generation
      const codeToTasksMap = new Map(); // Map code -> array of user tasks with that code
      const codeToMaxDateMap = new Map(); // Map code -> max created_at for that code
      
      userTasksJson.forEach(userTask => {
        if (!userTask.code) {
          // If no code, skip it (shouldn't happen, but handle edge case)
          return;
        }
        
        if (!codeToTasksMap.has(userTask.code)) {
          codeToTasksMap.set(userTask.code, []);
          codeToMaxDateMap.set(userTask.code, null);
        }
        
        codeToTasksMap.get(userTask.code).push(userTask);
        
        // Track the max created_at for this code
        const userTaskDate = new Date(userTask.created_at);
        const currentMax = codeToMaxDateMap.get(userTask.code);
        if (!currentMax || userTaskDate > currentMax) {
          codeToMaxDateMap.set(userTask.code, userTaskDate);
        }
      });

      // Find the newest code (generation) - the one with the latest created_at
      let newestCode = null;
      let newestDate = null;
      codeToMaxDateMap.forEach((maxDate, code) => {
        if (!newestDate || maxDate > newestDate) {
          newestDate = maxDate;
          newestCode = code;
        }
      });

      // Get all user tasks from the newest generation (code)
      const filteredUserTasks = newestCode ? codeToTasksMap.get(newestCode) || [] : [];

      // Log for debugging
      ctx.log?.info({ 
        newestCode, 
        filteredTasksCount: filteredUserTasks.length,
        mainTasksCount: filteredUserTasks.filter(ut => ut.is_main_task).length,
        childTasksCount: filteredUserTasks.filter(ut => !ut.is_main_task && ut.parent_user_task_id).length,
        allTaskIds: filteredUserTasks.map(ut => ut.id),
        childTaskIds: filteredUserTasks.filter(ut => !ut.is_main_task).map(ut => ({ id: ut.id, parent_id: ut.parent_user_task_id }))
      }, 'Filtered user tasks by newest code');

      // Separate main tasks and child tasks using is_main_task and parent_user_task_id
      const mainTasks = [];
      const childTasksMap = new Map(); // Map parent_user_task_id -> array of child user tasks
      const userTaskIdMap = new Map(); // Map user_task_id -> user_task for quick lookup

      // First pass: create maps and separate main/child tasks
      filteredUserTasks.forEach(userTask => {
        userTaskIdMap.set(userTask.id, userTask);
        
        if (userTask.is_main_task) {
          // This is a main task
          userTask.childTasks = [];
          mainTasks.push(userTask);
        } else if (userTask.parent_user_task_id) {
          // This is a child task - add it to childTasksMap
          const parentId = userTask.parent_user_task_id;
          if (!childTasksMap.has(parentId)) {
            childTasksMap.set(parentId, []);
          }
          childTasksMap.get(parentId).push(userTask);
        } else {
          // Task without parent or main flag, treat as standalone (main task)
          userTask.childTasks = [];
          userTask.is_main_task = true; // Ensure it's marked as main
          mainTasks.push(userTask);
        }
      });

      // Second pass: attach child tasks to their parent user tasks
      childTasksMap.forEach((childUserTasks, parentUserTaskId) => {
        const parentUserTask = userTaskIdMap.get(parentUserTaskId);
        if (parentUserTask) {
          if (!parentUserTask.childTasks) {
            parentUserTask.childTasks = [];
          }
          // Add children, avoiding duplicates
          const existingIds = new Set(parentUserTask.childTasks.map(ct => ct.id));
          childUserTasks.forEach(childUt => {
            if (!existingIds.has(childUt.id)) {
              parentUserTask.childTasks.push(childUt);
            }
          });
          
          // Log for debugging
          ctx.log?.info({ 
            parentUserTaskId, 
            parentIsMain: parentUserTask.is_main_task,
            childCount: parentUserTask.childTasks.length,
            childTaskIds: childUserTasks.map(ct => ct.id)
          }, 'Attached child tasks to parent');
        } else {
          // Log warning if parent not found (shouldn't happen if all from same generation)
          ctx.log?.warn({ 
            parentUserTaskId, 
            childTaskIds: childUserTasks.map(ct => ct.id),
            availableParentIds: Array.from(userTaskIdMap.keys())
          }, 'Parent user task not found for child tasks');
        }
      });
      
      // Ensure all main tasks have childTasks array (even if empty)
      // Also verify child tasks are properly attached
      mainTasks.forEach(mainTask => {
        if (!mainTask.childTasks) {
          mainTask.childTasks = [];
        }
        
        // Double-check: if this main task has children in childTasksMap, ensure they're attached
        if (childTasksMap.has(mainTask.id)) {
          const childrenFromMap = childTasksMap.get(mainTask.id);
          const existingIds = new Set(mainTask.childTasks.map(ct => ct.id));
          childrenFromMap.forEach(childUt => {
            if (!existingIds.has(childUt.id)) {
              mainTask.childTasks.push(childUt);
            }
          });
        }
        
        ctx.log?.info({ 
          mainTaskId: mainTask.id, 
          childTasksCount: mainTask.childTasks.length,
          childTaskIds: mainTask.childTasks.map(ct => ct.id)
        }, 'Main task child tasks check');
      });

      // Final verification: ensure child tasks are properly attached before building result
      const finalMainTasks = mainTasks.map(mainTask => {
        // Get child tasks from childTasksMap if they exist
        if (childTasksMap.has(mainTask.id)) {
          const childrenFromMap = childTasksMap.get(mainTask.id);
          if (!mainTask.childTasks) {
            mainTask.childTasks = [];
          }
          // Ensure all children are in the array
          const existingIds = new Set(mainTask.childTasks.map(ct => ct.id));
          childrenFromMap.forEach(childUt => {
            if (!existingIds.has(childUt.id)) {
              mainTask.childTasks.push(childUt);
            }
          });
        }
        return mainTask;
      });

      // Return array format: flat user task objects with sub_user_task array
      const result = finalMainTasks.map(mainTask => {
        // Use childTasks directly from the main task
        const childTasks = mainTask.childTasks || [];
        
        ctx.log?.info({ 
          mainTaskId: mainTask.id, 
          childTasksCount: childTasks.length,
          childTaskIds: childTasks.map(ct => ct.id)
        }, 'Building result for main task');
        
        // Create a flat object with all main task properties
        const userTaskObj = {
          user_task_id: mainTask.id,
          task_id: mainTask.task_id,
          user_id: mainTask.user_id,
          start_at: mainTask.start_at,
          completed_at: mainTask.completed_at,
          notes: mainTask.notes,
          status: mainTask.status,
          code: mainTask.code,
          is_main_task: mainTask.is_main_task,
          parent_user_task_id: mainTask.parent_user_task_id,
          created_at: mainTask.created_at,
          updated_at: mainTask.updated_at,
          task: mainTask.task,
          evidences: mainTask.evidences || [],
          sub_user_task: childTasks.map(childTask => ({
            user_task_id: childTask.id,
            task_id: childTask.task_id,
            user_id: childTask.user_id,
            start_at: childTask.start_at,
            completed_at: childTask.completed_at,
            notes: childTask.notes,
            status: childTask.status,
            code: childTask.code,
            is_main_task: childTask.is_main_task,
            parent_user_task_id: childTask.parent_user_task_id,
            created_at: childTask.created_at,
            updated_at: childTask.updated_at,
            task: childTask.task,
            evidences: childTask.evidences || [],
            sub_user_task: [] // Child tasks don't have sub-tasks
          }))
        };
        
        return userTaskObj;
      });

      return result;
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
        status: 2, // completed
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

        const matchingTaskGroupIds = matchingTaskGroups.map(tg => tg.toJSON().id);
        
        // Only generate user tasks for tasks that belong to matching task groups
        // If no matching task groups found, don't generate any tasks
        if (matchingTaskGroupIds.length === 0) {
          ctx.log?.info({ currentTime }, 'No matching task groups found for current time');
          return {
            created: 0,
            userTasks: []
          };
        }

        // Helper function to parse time
        const parseTime = (timeStr) => {
          if (!timeStr) return 0;
          const [hours, minutes] = timeStr.split(':').map(Number);
          return hours * 60 + minutes;
        };

        // Check if user tasks have already been generated for this user in the current task group time range
        // Get tasks that belong to matching task groups to check for existing user tasks
        const tasksToCheck = await this.taskModel.findAll({
          where: {
            task_group_id: { [Op.in]: matchingTaskGroupIds }
          },
          attributes: ['id']
        });
        
        const taskIdsToCheck = tasksToCheck.map(t => t.id);
        
        if (taskIdsToCheck.length > 0) {
          // Calculate the start of the current shift based on task group times
          const firstTaskGroup = matchingTaskGroups[0].toJSON();
          const [startH, startM] = firstTaskGroup.start_time.split(':').map(Number);
          const startMinutes = startH * 60 + startM;
          const currentMinutes = parseTime(currentTime);
          const [endH, endM] = firstTaskGroup.end_time.split(':').map(Number);
          const endMinutes = endH * 60 + endM;
          
          // Determine the start and end of the current shift period
          let shiftStart, shiftEnd;
          
          // Check if shift spans midnight (e.g., 19:00 to 04:00)
          if (endMinutes < startMinutes) {
            // Shift spans midnight
            if (currentMinutes >= startMinutes) {
              // We're in the early part (e.g., 19:00-23:59), shift started today, ends tomorrow
              shiftStart = now.clone().startOf('day').add(startMinutes, 'minutes');
              shiftEnd = now.clone().add(1, 'day').startOf('day').add(endMinutes, 'minutes');
            } else {
              // We're in the late part (e.g., 00:00-04:00), shift started yesterday, ends today
              shiftStart = now.clone().subtract(1, 'day').startOf('day').add(startMinutes, 'minutes');
              shiftEnd = now.clone().startOf('day').add(endMinutes, 'minutes');
            }
          } else {
            // Normal shift within same day
            if (currentMinutes >= startMinutes) {
              // Shift already started today
              shiftStart = now.clone().startOf('day').add(startMinutes, 'minutes');
              shiftEnd = now.clone().startOf('day').add(endMinutes, 'minutes');
            } else {
              // Shift hasn't started yet today (shouldn't happen as we only generate during matching time)
              // But handle edge case - shift started yesterday
              shiftStart = now.clone().subtract(1, 'day').startOf('day').add(startMinutes, 'minutes');
              shiftEnd = now.clone().subtract(1, 'day').startOf('day').add(endMinutes, 'minutes');
            }
          }
          
          // Check if we're still within the current shift period
          // If current time has passed shiftEnd, it's a new shift period and we should allow generation
          const isWithinCurrentShift = (now.isAfter(shiftStart) || now.isSame(shiftStart)) && now.isBefore(shiftEnd);
          
          if (isWithinCurrentShift) {
            // We're still within the current shift period - check if tasks were already generated
            const existingUserTasks = await this.userTaskModel.findAll({
              where: {
                user_id: userId,
                task_id: { [Op.in]: taskIdsToCheck },
                created_at: {
                  [Op.between]: [shiftStart.toDate(), shiftEnd.toDate()]
                }
              },
              limit: 1,
              transaction: t
            });
            
            if (existingUserTasks.length > 0) {
              ctx.log?.info({ userId, matchingTaskGroupIds, shiftStart: shiftStart.format(), shiftEnd: shiftEnd.format(), currentTime: now.format() }, 'User tasks already generated for this task group time range');
              throw new Error('User tasks have already been generated for this task group time range');
            }
          } else {
            // We're past the shift end or before shift start - it's a new shift period, allow generation
            ctx.log?.info({ userId, matchingTaskGroupIds, shiftStart: shiftStart.format(), shiftEnd: shiftEnd.format(), currentTime: now.format() }, 'New shift period detected, allowing generation');
          }
        }
        
        // Build where clause for tasks - only get tasks that belong to matching task groups
        const taskWhereClause = {
          task_group_id: { [Op.in]: matchingTaskGroupIds }
        };
        
        // Get all tasks with their schedules for today - ONLY from matching task groups
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
          ],
          transaction: t
        });

        // Get task IDs to find child tasks
        const taskIds = tasks.map(t => t.id);
        
        // Find all child tasks that belong to matching task groups
        // Use TaskParent junction table to find child tasks with multiple parents
        let childTasks = [];
        if (taskIds.length > 0 && this.taskParentModel) {
          // Get child task IDs from junction table
          const parentRelations = await this.taskParentModel.findAll({
            where: { parent_task_id: { [Op.in]: taskIds } },
            attributes: ['child_task_id'],
            transaction: t
          });
          const childTaskIds = [...new Set(parentRelations.map(rel => rel.child_task_id))];
          
          if (childTaskIds.length > 0) {
            // Get child tasks - include those with matching schedules OR those without schedules
            // (child tasks should be created when their parents are created)
            // NOTE: Child tasks should be created if their parent is being created,
            // regardless of whether the child belongs to a matching task group
            childTasks = await this.taskModel.findAll({
              where: {
                id: { [Op.in]: childTaskIds }
                // Remove task_group_id filter - child tasks should be included if their parent is included
              },
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
                  required: false // Make schedules optional for child tasks
                }
              ],
              transaction: t
            });
          }
        }

        // Combine parent tasks and child tasks for reference
        const allTasks = [...tasks, ...childTasks];

        // Store task info for sorting
        const taskInfoMap = new Map();
        for (const task of allTasks) {
          const taskJson = task.toJSON();
          taskInfoMap.set(task.id, {
            is_main_task: taskJson.is_main_task,
            schedules: taskJson.schedules || []
          });
        }

        // Collect user task data first (before creating in DB)
        // Generate a single code for this generation (to group all user tasks created together)
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
        const generationCode = `UT-${timestamp}-${randomSuffix}`;
        
        const userTaskDataToCreate = [];
        
        // Collect user tasks for each scheduled task (parent and child)
        // Only process parent tasks (from 'tasks' array), not child tasks
        // Child tasks will be created when processing their parent tasks
        for (const task of tasks) {
          const taskJson = task.toJSON();
          const taskSchedules = task.schedules || [];
          
          // Get task with related task_parents (child tasks)
          let childTaskIds = [];
          if (this.taskParentModel) {
            const parentRelations = await this.taskParentModel.findAll({
              where: { parent_task_id: task.id },
              attributes: ['child_task_id'],
              transaction: t
            });
            childTaskIds = parentRelations.map(rel => rel.child_task_id);
          }
          
          // If task has schedules, collect user task data for each schedule
          // If task has no schedules (e.g., child task without own schedules), collect one user task anyway
          if (taskSchedules.length > 0) {
            for (const schedule of taskSchedules) {
              const scheduleJson = schedule.toJSON ? schedule.toJSON() : schedule;
              const scheduleTime = scheduleJson.time || null;
              
              // Find the task group for this task
              const taskGroup = matchingTaskGroups.find(tg => tg.id === taskJson.task_group_id);
              const taskGroupJson = taskGroup ? taskGroup.toJSON() : null;
              
              // Create main task user task data for this schedule
              const isMainTask = taskJson.is_main_task === true;
              const mainTaskItem = {
                userTaskData: {
                  task_id: task.id,
                  user_id: userId,
                  start_at: null,
                  completed_at: null,
                  notes: null,
                  status: 'pending',
                  code: generationCode,
                  is_main_task: isMainTask,
                  parent_user_task_id: null
                },
                sortData: {
                  is_main_task: taskJson.is_main_task || false,
                  scheduleTime: scheduleTime,
                  taskId: task.id,
                  taskGroupStartTime: taskGroupJson?.start_time || null,
                  taskGroupEndTime: taskGroupJson?.end_time || null,
                  isChildOfTaskId: null
                },
                childTasks: [] // Will be populated with child tasks for this schedule
              };
              
              // Create child task user task data for this same schedule
              for (const childTaskId of childTaskIds) {
                let childTask = allTasks.find(t => t.id === childTaskId);
                
                // If child task not found in allTasks, fetch it directly
                if (!childTask && this.taskModel) {
                  childTask = await this.taskModel.findByPk(childTaskId, {
                    include: [
                      {
                        model: this.taskScheduleModel,
                        as: 'schedules',
                        required: false
                      }
                    ],
                    transaction: t
                  });
                }
                
                const childTaskJson = childTask ? childTask.toJSON() : null;
                
                if (childTaskJson) {
                  // Find the task group for the child task
                  const childTaskGroup = matchingTaskGroups.find(tg => tg.id === childTaskJson.task_group_id);
                  const childTaskGroupJson = childTaskGroup ? childTaskGroup.toJSON() : null;
                  
                  const childTaskItem = {
                    userTaskData: {
                      task_id: childTaskId,
                      user_id: userId,
                      start_at: null,
                      completed_at: null,
                      notes: null,
                      status: 'pending',
                      code: generationCode,
                      is_main_task: false,
                      parent_user_task_id: null // Will be set when creating
                    },
                    sortData: {
                      is_main_task: childTaskJson.is_main_task || false,
                      scheduleTime: scheduleTime, // Same schedule as parent
                      taskId: childTaskId,
                      taskGroupStartTime: childTaskGroupJson?.start_time || taskGroupJson?.start_time || null,
                      taskGroupEndTime: childTaskGroupJson?.end_time || taskGroupJson?.end_time || null,
                      isChildOfTaskId: task.id // Track which task this is a child of
                    }
                  };
                  
                  // Link child task to this main task instance
                  mainTaskItem.childTasks.push(childTaskItem);
                }
              }
              
              userTaskDataToCreate.push(mainTaskItem);
            }
          } else {
            // Task has no schedules (e.g., child task) - collect user task data anyway
            const taskGroup = matchingTaskGroups.find(tg => tg.id === taskJson.task_group_id);
            const taskGroupJson = taskGroup ? taskGroup.toJSON() : null;
            
            // Create main task user task data
            const isMainTask = taskJson.is_main_task === true;
            const mainTaskItem = {
              userTaskData: {
                task_id: task.id,
                user_id: userId,
                start_at: null,
                completed_at: null,
                notes: null,
                status: 'pending',
                code: generationCode,
                is_main_task: isMainTask,
                parent_user_task_id: null
              },
              sortData: {
                is_main_task: taskJson.is_main_task || false,
                scheduleTime: null, // No schedule time
                taskId: task.id,
                taskGroupStartTime: taskGroupJson?.start_time || null,
                taskGroupEndTime: taskGroupJson?.end_time || null,
                isChildOfTaskId: null
              },
              childTasks: [] // Will be populated with child tasks
            };
            
            // Create child task user task data
            for (const childTaskId of childTaskIds) {
              let childTask = allTasks.find(t => t.id === childTaskId);
              
              // If child task not found in allTasks, fetch it directly
              if (!childTask && this.taskModel) {
                childTask = await this.taskModel.findByPk(childTaskId, {
                  include: [
                    {
                      model: this.taskScheduleModel,
                      as: 'schedules',
                      required: false
                    }
                  ],
                  transaction: t
                });
              }
              
              const childTaskJson = childTask ? childTask.toJSON() : null;
              
              if (childTaskJson) {
                // Find the task group for the child task
                const childTaskGroup = matchingTaskGroups.find(tg => tg.id === childTaskJson.task_group_id);
                const childTaskGroupJson = childTaskGroup ? childTaskGroup.toJSON() : null;
                
                const childTaskItem = {
                  userTaskData: {
                    task_id: childTaskId,
                    user_id: userId,
                    start_at: null,
                    completed_at: null,
                    notes: null,
                    status: 'pending',
                    code: generationCode,
                    is_main_task: false,
                    parent_user_task_id: null // Will be set when creating
                  },
                  sortData: {
                    is_main_task: childTaskJson.is_main_task || false,
                    scheduleTime: null, // No schedule time
                    taskId: childTaskId,
                    taskGroupStartTime: childTaskGroupJson?.start_time || taskGroupJson?.start_time || null,
                    taskGroupEndTime: childTaskGroupJson?.end_time || taskGroupJson?.end_time || null,
                    isChildOfTaskId: task.id // Track which task this is a child of
                  }
                };
                
                // Link child task to this main task instance
                mainTaskItem.childTasks.push(childTaskItem);
              }
            }
            
            userTaskDataToCreate.push(mainTaskItem);
          }
        }

        // Since child tasks are already linked to their parent main tasks in the collection phase,
        // userTaskDataToCreate only contains main tasks (each with their childTasks array populated)
        // So we can use all items directly
        const mainTaskDataToCreate = userTaskDataToCreate;
        
        // Ensure all items have childTasks array initialized
        mainTaskDataToCreate.forEach(item => {
          if (!item.childTasks) {
            item.childTasks = [];
          }
        });

        // Sort main tasks purely by schedule time, using task group start_time as reference
        mainTaskDataToCreate.sort((a, b) => {
          const aSort = a.sortData;
          const bSort = b.sortData;
          
          const aTime = aSort.scheduleTime;
          const bTime = bSort.scheduleTime;
          
          // If no time specified, put at the end
          if (!aTime && !bTime) {
            // If both have no time, sort by task_id to maintain consistent order
            return aSort.taskId - bSort.taskId;
          }
          if (!aTime) return 1;
          if (!bTime) return -1;
          
          // Parse time to minutes for comparison
          const parseTime = (timeStr) => {
            if (!timeStr) return 0;
            const [hours, minutes] = timeStr.split(':').map(Number);
            return hours * 60 + minutes;
          };
          
          const aMinutes = parseTime(aTime);
          const bMinutes = parseTime(bTime);
          
          // Get task group times for determining "today" vs "tomorrow"
          const aGroupStart = parseTime(aSort.taskGroupStartTime);
          const aGroupEnd = parseTime(aSort.taskGroupEndTime);
          const bGroupStart = parseTime(bSort.taskGroupStartTime);
          const bGroupEnd = parseTime(bSort.taskGroupEndTime);
          
          // Determine if time is in current shift or next shift
          // For shift that spans midnight (e.g., 19:00 to 04:00):
          // - Times from start_time to 23:59 are "today" (early shift)
          // - Times from 00:00 to end_time are "today" (late shift)
          // - Times after end_time but before start_time are "tomorrow" (next shift)
          const getShiftOffset = (timeMinutes, groupStart, groupEnd) => {
            if (!groupStart && !groupEnd) return 0;
            
            // If shift doesn't span midnight (normal case)
            if (groupEnd >= groupStart) {
              // Time is in shift range = today (0), outside = tomorrow (1)
              return (timeMinutes >= groupStart && timeMinutes <= groupEnd) ? 0 : 1;
            }
            
            // Shift spans midnight (e.g., 19:00 to 04:00)
            // Times from start to 23:59 (1440 minutes) are "today"
            // Times from 0 to end are "today"
            // Times from end+1 to start-1 are "tomorrow"
            if (timeMinutes >= groupStart || timeMinutes <= groupEnd) {
              return 0; // In current shift (today)
            }
            return 1; // Outside current shift (tomorrow)
          };
          
          // Calculate sort order based on shift offset and time
          const getSortValue = (timeMinutes, groupStart, groupEnd) => {
            const shiftOffset = getShiftOffset(timeMinutes, groupStart, groupEnd);
            
            if (shiftOffset === 0) {
              // Within current shift - handle midnight wrap-around
              if (groupEnd < groupStart && timeMinutes <= groupEnd) {
                // Time is in the late part of shift (00:00 to end_time)
                // Add 1440 to make it sort after early times (19:00-23:59)
                return timeMinutes + 1440;
              }
              // Time is in early part of shift (start_time to 23:59)
              return timeMinutes;
            }
            
            // Outside current shift (tomorrow)
            // Add a large number to ensure they come after today
            return shiftOffset * 1440 + timeMinutes;
          };
          
          const aSortValue = getSortValue(aMinutes, aGroupStart, aGroupEnd);
          const bSortValue = getSortValue(bMinutes, bGroupStart, bGroupEnd);
          
          // Compare by calculated sort value
          if (aSortValue !== bSortValue) {
            return aSortValue - bSortValue;
          }
          
          // If same sort value, maintain order by task_id for consistency
          return aSort.taskId - bSort.taskId;
        });
        
        // Now create all user tasks in sorted order
        const createdUserTasks = [];
        const mainTaskUserTasks = [];
        
        // Helper function to create user task and attach sort data
        const createUserTaskWithSortData = async (item) => {
          const userTask = await this.create(item.userTaskData, ctx, t);
          userTask._sortData = item.sortData;
          if (item.childTasks) {
            userTask.childTasks = [];
          }
          return userTask;
        };
        
        // Create main tasks in sorted order
        for (const mainTaskItem of mainTaskDataToCreate) {
          const mainUserTask = await createUserTaskWithSortData(mainTaskItem);
          
          ctx.log?.info({ 
            mainTaskId: mainTaskItem.userTaskData.task_id,
            mainUserTaskId: mainUserTask.id,
            scheduleTime: mainTaskItem.sortData.scheduleTime,
            childTasksCount: mainTaskItem.childTasks?.length || 0
          }, 'Creating main user task with children');
          
          // Create child tasks for this main task if any
          if (mainTaskItem.childTasks && mainTaskItem.childTasks.length > 0) {
            for (const childTaskItem of mainTaskItem.childTasks) {
              // Set parent_user_task_id for child user task
              childTaskItem.userTaskData.parent_user_task_id = mainUserTask.id;
              childTaskItem.userTaskData.is_main_task = false; // Ensure child tasks are marked as not main
              
              ctx.log?.info({ 
                childTaskId: childTaskItem.userTaskData.task_id,
                parentUserTaskId: mainUserTask.id,
                scheduleTime: childTaskItem.sortData.scheduleTime
              }, 'Creating child user task');
              
              const childUserTask = await createUserTaskWithSortData(childTaskItem);
              
              // Verify parent_user_task_id was set correctly
              if (!childUserTask.parent_user_task_id || childUserTask.parent_user_task_id !== mainUserTask.id) {
                ctx.log?.error({ 
                  childUserTaskId: childUserTask.id,
                  expectedParentId: mainUserTask.id,
                  actualParentId: childUserTask.parent_user_task_id
                }, 'WARNING: Child user task parent_user_task_id mismatch!');
              }
              
              mainUserTask.childTasks.push(childUserTask);
              createdUserTasks.push(childUserTask);
            }
          }
          
          mainTaskUserTasks.push(mainUserTask);
          createdUserTasks.push(mainUserTask);
        }
        
        // Remove temporary sort data from all user tasks
        const removeSortData = (ut) => {
          delete ut._sortData;
          if (ut.childTasks && Array.isArray(ut.childTasks)) {
            ut.childTasks.forEach(ct => removeSortData(ct));
          }
        };
        
        mainTaskUserTasks.forEach(ut => removeSortData(ut));
        
        // Calculate total created (main tasks + child tasks)
        const totalCreated = createdUserTasks.length;
        
        return {
          created: totalCreated,
          userTasks: mainTaskUserTasks
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
