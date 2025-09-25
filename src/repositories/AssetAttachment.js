class AssetAttachmentRepistory {
  constructor(assetAttachmentModel) {
    this.assetAttachmentModel = assetAttachmentModel;
  }

  async create(data, tx = null) {
    return this.assetAttachmentModel.create(data, {transaction: tx})
  }

  async getByAssetID(assetID) {
    return this.assetAttachmentModel.findAll({
      where: { asset_id: assetID }
    })
  }
};

module.exports = AssetAttachmentRepistory;
