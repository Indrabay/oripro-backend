const { DataTypes, Model } = require('sequelize');
const sequelize = require('./sequelize');

class AssetLog extends Model {}

AssetLog.init({
  id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  asset_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  old_data: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  new_data: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize,
  modelName: 'AssetLog',
  tableName: 'asset_logs',
  timestamps: false,
  indexes: [
    { fields: ['asset_id'] },
  ],
});

AssetLog.associate = (models) => {
  AssetLog.belongsTo(models.User, {
    foreignKey: 'created_by',
    as: 'createdBy',
  })
}

module.exports = AssetLog;