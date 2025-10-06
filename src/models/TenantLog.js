const { DataTypes, Model } = require('sequelize');
const sequelize = require('./sequelize');

class TenantLog extends Model {}

TenantLog.init({
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  tenant_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  contract_begin_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  contract_end_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  rent_duration: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  rent_duration_unit: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: true
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
  TenantLog.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user'
  })
}

module.exports = TenantLog;