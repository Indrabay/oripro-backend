const { DataTypes, Model } = require('sequelize');
const sequelize = require('./sequelize');

class TaskParent extends Model {}

TaskParent.init({
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  child_task_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'tasks',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  parent_task_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'tasks',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize,
  modelName: 'TaskParent',
  tableName: 'task_parents',
  timestamps: false,
  indexes: [
    { fields: ['child_task_id'] },
    { fields: ['parent_task_id'] },
    { fields: ['child_task_id', 'parent_task_id'], unique: true },
  ],
});

TaskParent.associate = (models) => {
  TaskParent.belongsTo(models.Task, {
    foreignKey: 'child_task_id',
    as: 'childTask',
  });
  TaskParent.belongsTo(models.Task, {
    foreignKey: 'parent_task_id',
    as: 'parentTask',
  });
};

module.exports = TaskParent;

