const { DataTypes, Model} = require('sequelize');
const sequelize = require('./sequelize');

class UserAsset extends Model {}

UserAsset.init({
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  asset_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  created_by: DataTypes.UUID,
  updated_by: DataTypes.UUID,
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize,
  modelName: 'UserAsset',
  tableName: 'user_assets',
  timestamps: false,
  indexes: [
    {fields: ['user_id']}
  ],
})

module.exports = UserAsset;