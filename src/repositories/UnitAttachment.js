class UnitAttachmentRepository {
  constructor(unitAttachmentModel) {
    this.unitAttachmentModel = unitAttachmentModel;
  }

  async create(data, ctx = null, tx = null) {
    const createData = {
      unit_id: data.unit_id,
      url: data.url,
    }
    return this.unitAttachmentModel.create(createData, {transaction: tx});
  };

  async getByUnitID(unitID) {
    return this.unitAttachmentModel.findAll({
      where: { unit_id: unitID }
    });
  }
};

module.exports = UnitAttachmentRepository;
