const { DataTypes, Model } = require('sequelize');
const sequelize = require('./sequelize');

class TaskLog extends Model {}

TaskLog.init({
  id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  task_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  name: DataTypes.STRING,
  is_main_task: DataTypes.BOOLEAN,
  is_need_validation: DataTypes.BOOLEAN,
  is_scan: DataTypes.BOOLEAN,
  scan_code: DataTypes.STRING,
  duration: DataTypes.INTEGER,
  asset_id: DataTypes.UUID,
  role_id: DataTypes.INTEGER,
  is_all_times: DataTypes.BOOLEAN,
  parent_task_id: DataTypes.BIGINT,
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  created_by: DataTypes.UUID
}, {
  sequelize,
  modelName: 'TaskLog',
  tableName: 'task_logs',
  timestamps: false,
  indexes: [
    { fields: ['task_id'] },
  ],
});

TaskLog.associate = (models) => {
  TaskLog.belongsTo(models.User, {
    foreignKey: 'created_by',
    as: 'createdBy',
  });
  TaskLog.belongsTo(models.Task, {
    foreignKey: 'task_id',
    as: 'task',
  });
}

module.exports = TaskLog;

