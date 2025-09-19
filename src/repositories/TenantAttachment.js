class TenantAttachmentRepositoy {
  constructor(tenantAttachmentModel) {
    this.tenantAttachmentModel = tenantAttachmentModel;
  }

  async create(data, tx = null) {
    return this.tenantAttachmentModel.create(data, {transaction: tx});
  }
}

module.exports = TenantAttachmentRepositoy;