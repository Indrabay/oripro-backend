class UserAssetRepository {
  constructor(userAssetModel) {
    this.userAssetModel = userAssetModel;
  }

  async create(data, ctx) {
    try {
      ctx.log?.info(data, "UserAssetRepository.create");
      const userAssetData = {
        user_id: data.user_id,
        asset_id: data.asset_id,
        created_by: ctx.userId,
      }
      await this.userAssetModel.create(userAssetData);
    } catch (error) {
      ctx.log?.error(data, `UserAssetRepository.create_error. with err: ${error.message}`);
      throw error;
    };
  };

  async getByUserID(userID, ctx) {
    try {
      ctx.log?.info({user_id: userID}, "UserAssetRepository.getByUserID");
      const userAssets = await this.userAssetModel.findAll({
        where: { user_id: userID }
      });

      return userAssets.map(ua => ua.toJSON());
    } catch (error) {
      ctx.log?.error({user_id: userID}, `UserAssetRepository.getByUserID_error. with err: ${error.message}`);
      throw error;
    }
  }

  async remove(data, ctx) {
    try {
      ctx.log?.info(data, "UserAssetRepository.remove");
      await this.userAssetModel.destroy({
        where: { user_id: data.user_id, asset_id: data.asset_id }
      });
    } catch (error) {
      ctx.log?.error(data, `UserAssetRepository.remove_error. with err: ${error.message}`);
      throw error;
    }
  }
}

module.exports = UserAssetRepository;