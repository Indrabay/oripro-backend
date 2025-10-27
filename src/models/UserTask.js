const { DataTypes, Model } = require('sequelize');
const sequelize = require('./sequelize');

class UserTask extends Model {}

UserTask.init({
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  task_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  start_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: 'UserTask',
  tableName: 'user_tasks',
  timestamps: false,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['task_id'] },
    { fields: ['user_id', 'task_id'] },
  ],
});

UserTask.associate = (models) => {
  UserTask.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user',
  });
  UserTask.belongsTo(models.Task, {
    foreignKey: 'task_id',
    as: 'task',
  });
  UserTask.hasMany(models.UserTaskEvidence, {
    foreignKey: 'user_task_id',
    as: 'evidences',
  });
};

module.exports = UserTask;
