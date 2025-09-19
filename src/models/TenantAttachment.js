const { DataTypes, Model } = require('sequelize');
const sequelize = require('./sequelize');

class TenantAttachmentModel extends Model {}

const AttachmentType = {
  "id": 1,
  "contract": 2
}

TenantAttachmentModel.init({
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  tenant_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  attachment_type: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'TenantAttachment',
  tableName: 'tenant-attachments',
  timestamps: false,
});
