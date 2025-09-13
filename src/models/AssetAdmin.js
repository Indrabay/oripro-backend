const { DataTypes, Model } = require('sequelize');
const sequelize = require('./sequelize');

class AssetAdmin extends Model {}

AssetAdmin.init({
  asset_id: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true,
  },
}, {
  sequelize,
  modelName: 'AssetAdmin',
  tableName: 'asset_admins',
  timestamps: false,
});

module.exports = AssetAdmin;
