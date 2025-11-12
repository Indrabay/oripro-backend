const { DataTypes, Model } = require('sequelize');
const sequelize = require('./sequelize');

class TenantPaymentLog extends Model {}

TenantPaymentLog.init({
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  tenant_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  payment_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  payment_method: {
    type: DataTypes.ENUM('cash', 'bank_transfer', 'qris', 'other'),
    allowNull: false,
  },
  notes: {
    type: DataTypes.TEXT,
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
  modelName: 'TenantPaymentLog',
  tableName: 'tenant_payment_logs',
  timestamps: false,
  indexes: [
    { fields: ['tenant_id'] },
    { fields: ['payment_date'] },
    { fields: ['created_at'] },
  ],
});

TenantPaymentLog.associate = (models) => {
  TenantPaymentLog.belongsTo(models.Tenant, {
    foreignKey: 'tenant_id',
    as: 'tenant',
  });
  TenantPaymentLog.belongsTo(models.User, {
    foreignKey: 'created_by',
    as: 'createdBy',
  });
  TenantPaymentLog.belongsTo(models.User, {
    foreignKey: 'updated_by',
    as: 'updatedBy',
  });
};

module.exports = TenantPaymentLog;

