const { DataTypes, Model } = require('sequelize');
const sequelize = require('./sequelize');

class TaskSchedule extends Model {}

TaskSchedule.init({
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  task_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  day_of_week: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'all',
  },
  time: DataTypes.STRING,
  created_by: DataTypes.UUID,
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize,
  modelName: 'TaskSchedule',
  tableName: 'task_schedules',
  timestamps: false,
});

module.exports = TaskSchedule;