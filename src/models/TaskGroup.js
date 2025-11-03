const { DataTypes, Model } = require('sequelize');
const sequelize = require('./sequelize');

class TaskGroup extends Model {}

TaskGroup.init({
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  start_time: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Start time in HH:mm format (e.g., 06:00 for morning shift)'
  },
  end_time: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'End time in HH:mm format (e.g., 14:00 for morning shift)'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
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
  },
}, {
  sequelize,
  modelName: 'TaskGroup',
  tableName: 'task_groups',
  timestamps: false,
  indexes: [
    { fields: ['start_time', 'end_time'] },
    { fields: ['is_active'] },
  ],
});

TaskGroup.associate = (models) => {
  TaskGroup.hasMany(models.Task, {
    foreignKey: 'task_group_id',
    as: 'tasks',
  });
  TaskGroup.belongsTo(models.User, {
    foreignKey: 'created_by',
    as: 'createdBy',
  });
  TaskGroup.belongsTo(models.User, {
    foreignKey: 'updated_by',
    as: 'updatedBy',
  });
};

module.exports = TaskGroup;

