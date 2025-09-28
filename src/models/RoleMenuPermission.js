const { DataTypes, Model } = require('sequelize');
const sequelize = require('./sequelize');

class RoleMenuPermission extends Model {}

RoleMenuPermission.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  role_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'roles',
      key: 'id',
    },
  },
  menu_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'menus',
      key: 'id',
    },
  },
  can_view: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
  can_create: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
  can_update: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
  can_delete: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
  can_confirm: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'RoleMenuPermission',
  tableName: 'role_menu_permissions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['role_id'],
    },
    {
      fields: ['menu_id'],
    },
    {
      unique: true,
      fields: ['role_id', 'menu_id'],
      name: 'unique_role_menu_permission',
    },
  ],
});

// Define associations
RoleMenuPermission.associate = (models) => {
  RoleMenuPermission.belongsTo(models.Role, {
    as: 'role',
    foreignKey: 'role_id',
  });
  
  RoleMenuPermission.belongsTo(models.Menu, {
    as: 'menu',
    foreignKey: 'menu_id',
  });
};

module.exports = RoleMenuPermission;
