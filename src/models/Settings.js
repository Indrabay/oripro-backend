const { DataTypes, Model } = require('sequelize');
const sequelize = require('./sequelize');

class Settings extends Model {}

Settings.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  description: {
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
    defaultValue: DataTypes.NOW,
  }
}, {
  sequelize,
  modelName: 'Settings',
  tableName: 'settings',
  timestamps: false,
  indexes: [{ fields: ['key'] }],
});

Settings.associate = (models) => {
  Settings.belongsTo(models.User, {
    foreignKey: 'created_by',
    as: 'createdBy',
  });
  Settings.belongsTo(models.User, {
    foreignKey: 'updated_by',
    as: 'updatedBy',
  });
};

module.exports = Settings;

