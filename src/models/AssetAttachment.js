const { DataTypes, Model } = require('sequelize');
const sequelize = require('./sequelize');

class AssetAttachment extends Model {};

const AttachmentType = {
  "photo": 1,
  "sketch": 2,
}

AssetAttachment.init({
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  asset_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  attachment_type: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
}, {
  sequelize,
  modelName: 'AssetAttachment',
  tableName: 'asset_attachments',
  timestamps: false,
  indexes: [
    { fields: ['asset_id'] },
  ],
});

module.exports = { AssetAttachment, AttachmentType };