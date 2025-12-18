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

  async delete(id, ctx = {}) {
    const options = { where: { id } };
    if (ctx.transaction) {
      options.transaction = ctx.transaction;
    }
    return this.assetAttachmentModel.destroy(options);
  }
};

module.exports = AssetAttachmentRepistory;
