const { DataTypes, Model } = require('sequelize');
const sequelize = require('./sequelize');

const PaymentLogStatusStrToInt = {
  'unpaid': 0,
  'paid': 1,
  'expired': 2
};

const PaymentLogStatusIntToStr = {
  0: 'unpaid',
  1: 'paid',
  2: 'expired'
};

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
  paid_amount: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Amount paid - will be filled when payment is made'
  },
  payment_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Payment date - will be filled when payment is made'
  },
  payment_deadline: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Payment deadline date for this payment'
  },
  payment_method: {
    type: DataTypes.ENUM('cash', 'bank_transfer', 'qris', 'other'),
    allowNull: false,
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0, // 0 = unpaid
    comment: 'Status: 0=unpaid, 1=paid, 2=expired'
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
    { fields: ['payment_deadline'] },
    { fields: ['created_at'] },
    { fields: ['status'] },
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

module.exports = { TenantPaymentLog, PaymentLogStatusStrToInt, PaymentLogStatusIntToStr };

