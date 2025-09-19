class TenantAttachmentRepositoy {
  constructor(tenantAttachmentModel) {
    this.tenantAttachmentModel = tenantAttachmentModel;
  }

  async create(data) {
    return this.tenantAttachmentModel.create(data);
  }
}