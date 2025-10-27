const { DataTypes, Model } = require('sequelize');
const sequelize = require('./sequelize');

class TenantLog extends Model {}

TenantLog.init({
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  tenant_id: {
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
  modelName: 'TenantLog',
  tableName: 'tenant_logs',
  timestamps: false,
})

TenantLog.associate = (models) => {
  TenantLog.belongsTo(models.User, {
    foreignKey: 'created_by',
    as: 'createdBy',
  });
}

module.exports = TenantLog;