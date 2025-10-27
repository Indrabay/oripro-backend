const { DataTypes, Model } = require('sequelize');
const sequelize = require('./sequelize');

class UserTaskEvidence extends Model {}

UserTaskEvidence.init({
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  user_task_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  evidence_type: {
    type: DataTypes.ENUM('photo', 'video', 'scan', 'text', 'file'),
    allowNull: false,
  },
  file_path: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  file_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  file_size: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  mime_type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  scan_code: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  latitude: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  longitude: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize,
  modelName: 'UserTaskEvidence',
  tableName: 'user_task_evidences',
  timestamps: false,
  indexes: [
    { fields: ['user_task_id'] },
    { fields: ['evidence_type'] },
    { fields: ['created_at'] },
  ],
});

UserTaskEvidence.associate = (models) => {
  UserTaskEvidence.belongsTo(models.UserTask, {
    foreignKey: 'user_task_id',
    as: 'userTask',
  });
};

module.exports = UserTaskEvidence;
