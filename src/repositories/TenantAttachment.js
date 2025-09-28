class TenantAttachmentRepositoy {
  constructor(tenantAttachmentModel) {
    this.tenantAttachmentModel = tenantAttachmentModel;
  }

  async create(data, tx = null) {
    return this.tenantAttachmentModel.create(data, {transaction: tx});
  }

  async getByTenantID(tenantID) {
    return this.tenantAttachmentModel.findAll({
      where: { tenant_id: tenantID }
    });
  };
}

module.exports = TenantAttachmentRepositoy;