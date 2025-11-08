const { DataTypes, Model } = require('sequelize');
const sequelize = require('./sequelize');

class DepositoLog extends Model {}

DepositoLog.init({
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  tenant_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  old_deposit: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  new_deposit: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  reason: {
    type: DataTypes.TEXT,
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
  modelName: 'DepositoLog',
  tableName: 'deposito_logs',
  timestamps: false,
});

DepositoLog.associate = (models) => {
  DepositoLog.belongsTo(models.Tenant, {
    foreignKey: 'tenant_id',
    as: 'tenant',
  });
  DepositoLog.belongsTo(models.User, {
    foreignKey: 'created_by',
    as: 'createdBy',
  });
};

module.exports = DepositoLog;

