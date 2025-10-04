const { DataTypes, Model } = require('sequelize');
const sequelize = require('./sequelize');

class User extends Model {}

const UserGenderStrToInt = {
  'male': 1,
  'female': 2
}

const UserGenderIntToStr = {
  1: 'male',
  2: 'female'
}

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
  gender: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  name: DataTypes.STRING,
  role_id: DataTypes.INTEGER,
  status: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
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

// Define associations
User.associate = (models) => {
  User.belongsTo(models.Role, {
    as: 'role',
    foreignKey: 'role_id',
  });
};

module.exports = { User, UserGenderStrToInt, UserGenderIntToStr };
