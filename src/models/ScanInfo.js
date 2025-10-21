const { DataTypes, Model } = require('sequelize');
const sequelize = require('./sequelize');

class ScanInfo extends Model {}

ScanInfo.init({
  id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  scan_code: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  latitude: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  longitude: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  updated_by: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: 'ScanInfo',
  tableName: 'scan_infos',
  timestamps: false,
  indexes: [
    { fields: ['scan_code'] },
  ],
});

ScanInfo.associate = (models) => {
  ScanInfo.belongsTo(models.User, {
    foreignKey: 'created_by',
    as: 'createdBy',
  });
  ScanInfo.belongsTo(models.User, {
    foreignKey: 'updated_by',
    as: 'updatedBy',
  });
};

module.exports = ScanInfo;

