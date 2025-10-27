class UserLogRepository {
  constructor(userLogModel, userModel) {
    this.userLogModel = userLogModel;
    this.userModel = userModel;
  }

  async create(data, ctx) {
    try {
      ctx.log?.info({ user_id: data.user_id }, "UserLogRepository.create");
      return await this.userLogModel.create(data);
    } catch (error) {
      ctx.log?.error({ error, data }, "UserLogRepository.create_error");
      throw error;
    }
  }

  async getByUserID(userID, ctx) {
    try {
      ctx.log?.info({ user_id: userID }, "UserLogRepository.getByUserID");
      
      const userLogs = await this.userLogModel.findAll({
        where: { user_id: userID },
        order: [["created_at", "DESC"]],
        include: [
          {
            model: this.userModel,
            as: "createdBy",
            attributes: ["id", "name", "email"],
          },
        ],
      });
      
      ctx.log?.info({ user_id: userID, rawLogsCount: userLogs.length }, "UserLogRepository.getByUserID_raw_result");
      
      const mappedLogs = userLogs.map((u) => {
        const log = u.toJSON();
        // Ensure created_by is properly mapped
        if (log.createdBy) {
          log.created_by = log.createdBy;
          delete log.createdBy;
        }
        return log;
      });
      
      ctx.log?.info({ user_id: userID, mappedLogsCount: mappedLogs.length }, "UserLogRepository.getByUserID_mapped_result");
      return mappedLogs;
    } catch (error) {
      ctx.log?.error(
        { error, user_id: userID },
        "UserLogRepository.getByUserID_error"
      );
      throw error;
    }
  }

  async getAll(ctx, options = {}) {
    try {
      ctx.log?.info({ options }, "UserLogRepository.getAll");
      const { limit = 50, offset = 0, order = [["created_at", "DESC"]] } = options;
      
      const userLogs = await this.userLogModel.findAndCountAll({
        limit,
        offset,
        order,
        include: [
          {
            model: this.userModel,
            as: "user",
            attributes: ["id", "name", "email"],
          },
          {
            model: this.userModel,
            as: "createdBy",
            attributes: ["id", "name", "email"],
          },
        ],
      });
      
      return {
        data: userLogs.rows.map((u) => {
          const log = u.toJSON();
          // Ensure created_by is properly mapped
          if (log.createdBy) {
            log.created_by = log.createdBy;
            delete log.createdBy;
          }
          return log;
        }),
        total: userLogs.count,
      };
    } catch (error) {
      ctx.log?.error({ error, options }, "UserLogRepository.getAll_error");
      throw error;
    }
  }

  /**
   * Remove (delete) all user logs for a given user ID.
   * @param {string} userId
   * @param {object} ctx
   * @returns {Promise<number>} - Number of deleted rows
   */
  async remove(userId, ctx = {}) {
    try {
      ctx.log?.info({ userId }, "UserLogRepository.remove_start");
      const numDeleted = await this.userLogModel.destroy({
        where: { user_id: userId },
      });
      ctx.log?.info({ userId, numDeleted }, "UserLogRepository.remove_success");
      return numDeleted;
    } catch (error) {
      ctx.log?.error({ error, userId }, "UserLogRepository.remove_error");
      throw error;
    }
  }
}

module.exports = UserLogRepository;
