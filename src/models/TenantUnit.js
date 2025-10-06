const { DataTypes, Model } = require('sequelize');
const sequelize = require('./sequelize');

class TenantUnit extends Model {}

TenantUnit.init({
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  tenant_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  unit_id: {
    type: DataTypes.UUID,
    allowNull: false,
  }
}, {
  sequelize,
  modelName: 'TenantUnit',
  tableName: 'tenant_units',
  timestamps: false,
});

module.exports = TenantUnit;
