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
      const result = await this.userAssetModel.create(userAssetData);
      ctx.log?.info({ result: result.toJSON() }, "UserAssetRepository.create_success");
      return result.toJSON();
    } catch (error) {
      ctx.log?.error(data, `UserAssetRepository.create_error. with err: ${error.message}`);
      throw error;
    }
  };

  async getByUserID(userID, ctx) {
    try {
      ctx.log?.info({user_id: userID}, "UserAssetRepository.getByUserID");
      const userAssets = await this.userAssetModel.findAll({
        where: { user_id: userID },
        include: [
          {
            model: this.userAssetModel.sequelize.models.Asset,
            as: 'asset',
            attributes: ['id', 'name', 'code', 'description', 'asset_type', 'status', 'address', 'area', 'longitude', 'latitude']
          }
        ]
      });

      return userAssets.map(ua => {
        const userAsset = ua.toJSON();
        // Ensure asset data is properly formatted
        if (userAsset.asset) {
          userAsset.asset_name = userAsset.asset.name;
          userAsset.asset_code = userAsset.asset.code;
          userAsset.asset_address = userAsset.asset.address;
          userAsset.asset_type = userAsset.asset.asset_type;
          userAsset.asset_status = userAsset.asset.status;
        }
        return userAsset;
      });
    } catch (error) {
      ctx.log?.error({user_id: userID}, `UserAssetRepository.getByUserID_error. with err: ${error.message}`);
      throw error;
    }
  }

  async remove(data, ctx) {
    try {
      ctx.log?.info(data, "UserAssetRepository.remove");
      console.log(data)
      console.log("delete asset")
      if (data.asset_id && data.asset_id !== null && data.asset_id !== undefined) {
        console.log(data.user_id, data.asset_id)
        await this.userAssetModel.destroy({
          where: { user_id: data.user_id, asset_id: data.asset_id }
        });
      } else {
        console.log(data.user_id)
        await this.userAssetModel.destroy({
          where: { user_id: data.user_id }
        });
      }
    } catch (error) {
      ctx.log?.error(data, `UserAssetRepository.remove_error. with err: ${error.message}`);
      throw error;
    }
  }
}

module.exports = UserAssetRepository;