const { DataTypes, Model } = require('sequelize');
const sequelize = require('./sequelize');

class Role extends Model {}

Role.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  level: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'Role',
  tableName: 'roles',
  timestamps: false,
});

module.exports = Role;
