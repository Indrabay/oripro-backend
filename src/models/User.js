const { DataTypes, Model } = require('sequelize');
const sequelize = require('./sequelize');

class User extends Model {}

User.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING(320),
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  name: DataTypes.STRING,
  role_id: DataTypes.UUID,
  created_by: DataTypes.UUID,
  updated_by: DataTypes.UUID,
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users',
  timestamps: false,
});

module.exports = User;
