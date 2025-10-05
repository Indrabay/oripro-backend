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
  name: DataTypes.STRING,
  code: DataTypes.STRING(100),
  description: DataTypes.TEXT,
  asset_type: DataTypes.INTEGER,
  status: DataTypes.INTEGER,
  address: DataTypes.STRING(100),
  area: DataTypes.DECIMAL(10,2),
  longitude: DataTypes.DOUBLE,
  latitude: DataTypes.DOUBLE,
  is_deleted: DataTypes.BOOLEAN,
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  created_by: DataTypes.UUID
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