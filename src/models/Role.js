const { DataTypes, Model } = require('sequelize');
const sequelize = require('./sequelize');

class Role extends Model {}

Role.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
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

// Define associations
Role.associate = (models) => {
  // Association with RoleMenuPermission
  Role.hasMany(models.RoleMenuPermission, {
    as: 'menuPermissions',
    foreignKey: 'role_id',
    onDelete: 'CASCADE',
  });

  // Many-to-many relationship with Menu through RoleMenuPermission
  Role.belongsToMany(models.Menu, {
    through: models.RoleMenuPermission,
    as: 'menus',
    foreignKey: 'role_id',
    otherKey: 'menu_id',
  });

  // Association with User
  Role.hasMany(models.User, {
    as: 'users',
    foreignKey: 'role_id',
  });
};

module.exports = Role;
