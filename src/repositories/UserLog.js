class UserLogRepository {
  constructor(userLogModel, userModel, roleModel) {
    this.userLogModel = userLogModel;
    this.userModel = userModel;
    this.roleModel = roleModel;
  }

  async create(data, ctx) {
    try {
      ctx.log?.info({ user_id: data.user_id }, "UserLogRepository.create");
      await this.userLogModel.create(data);
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
          {
            model: this.roleModel,
            as: "role",
            attributes: ["id", "name", "level"],
          },
        ],
      });
      return userLogs.map((u) => u.toJSON());
    } catch (error) {
      ctx.log?.error(
        { error, user_id: userID },
        "UserLogRepository.getByUserID_error"
      );
      throw error;
    }
  }
}

module.exports = UserLogRepository;
