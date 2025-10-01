const { DataTypes, Model } = require('sequelize');
const sequelize = require('./sequelize');

class Menu extends Model {}

Menu.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  icon: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  parent_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'menus',
      key: 'id',
    },
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  },
  can_view: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  },
  can_add: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
  can_edit: {
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
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  updated_by: {
    type: DataTypes.UUID,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: 'Menu',
  tableName: 'menus',
  timestamps: false,
  indexes: [
    {
      fields: ['parent_id'],
    },
    {
      fields: ['order'],
    },
    {
      fields: ['is_active'],
    },
  ],
});

// Define associations
Menu.associate = (models) => {
  // Self-referencing association for parent-child relationship
  Menu.hasMany(models.Menu, {
    as: 'children',
    foreignKey: 'parent_id',
    onDelete: 'CASCADE',
  });

  Menu.belongsTo(models.Menu, {
    as: 'parent',
    foreignKey: 'parent_id',
  });

  // Association with RoleMenuPermission
  Menu.hasMany(models.RoleMenuPermission, {
    as: 'rolePermissions',
    foreignKey: 'menu_id',
    onDelete: 'CASCADE',
  });

  // Many-to-many relationship with Role through RoleMenuPermission
  Menu.belongsToMany(models.Role, {
    through: models.RoleMenuPermission,
    as: 'roles',
    foreignKey: 'menu_id',
    otherKey: 'role_id',
  });
};

module.exports = Menu;
