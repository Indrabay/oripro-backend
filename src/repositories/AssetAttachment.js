class AssetAttachmentRepistory {
  constructor(assetAttachmentModel) {
    this.assetAttachmentModel = assetAttachmentModel;
  }

  async create(data, tx = null) {
    return this.assetAttachmentModel.create(data, {transaction: tx})
  }
};

module.exports = AssetAttachmentRepistory;
