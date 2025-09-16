const { DataTypes, Model } = require('sequelize');
const sequelize = require('./sequelize');

class Tenant extends Model {}

Tenant.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  unit_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  due_date_payment: {
    type: DataTypes.DATE,
    allowNull: false
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: true
  },
  updated_by: {
    type: DataTypes.UUID,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  sequelize,
  modelName: 'Tenant',
  tableName: 'tenants',
  timestamps: false,
});

module.exports = Tenant;