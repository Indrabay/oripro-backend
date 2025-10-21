const { DataTypes, Model } = require('sequelize');
const sequelize = require('./sequelize');

class Task extends Model {}

Task.init({
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  is_main_task: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  is_need_validation: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  is_scan: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  scan_code: DataTypes.STRING,
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  asset_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  role_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  is_all_times: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  parent_task_id: DataTypes.BIGINT,
  created_by: {
    type: DataTypes.UUID,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize,
  modelName: 'Task',
  tableName: 'tasks',
  timestamps: false,
});

Task.associate = (models) => {
  Task.belongsTo(models.User, {
    foreignKey: 'created_by',
    as: 'createdBy',
  });
  Task.belongsTo(models.Asset, {
    foreignKey: 'asset_id',
    as: 'asset'
  });
  Task.belongsTo(models.Role, {
    foreignKey: 'role_id',
    as: 'role',
  });
}

module.exports = Task;