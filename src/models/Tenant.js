const { DataTypes, Model } = require('sequelize');
const sequelize = require('./sequelize');

class Tenant extends Model {}

const DurationUnit = {
  "year": 0,
  "month": 1
}

const DurationUnitStr = {
  0: "year",
  1: "month"
}

const TenantStatusStrToInt = {
  'inactive': 0,
  'active': 1,
  'pending': 2,
  'expired': 3,
  'terminated': 4,
  'blacklisted': 5
}

const TenantStatusIntToStr = {
  0: 'inactive',
  1: 'active',
  2: 'pending',
  3: 'expired',
  4: 'terminated',
  5: 'blacklisted'
}

Tenant.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
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
    defaultValue: 2, // pending
    comment: 'Status: 0=inactive, 1=active, 2=pending, 3=expired, 4=terminated, 5=blacklisted'
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

Tenant.associate = (models) => {
  Tenant.belongsTo(models.User, {
    foreignKey: 'created_by',
    as: 'createdBy',
  });
  Tenant.belongsTo(models.User, {
    foreignKey: 'updated_by',
    as: 'updatedBy',
  });
  Tenant.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user'
  })
}

module.exports = {Tenant, DurationUnit, DurationUnitStr, TenantStatusIntToStr, TenantStatusStrToInt};