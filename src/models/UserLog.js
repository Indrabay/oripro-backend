const { DataTypes, Model } = require('sequelize');
const sequelize = require('./sequelize');

class UserLog extends Model {}

UserLog.init({
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  old_data: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  new_data: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize,
  modelName: 'UserLog',
  tableName: 'user_logs',
  timestamps: false,
});

UserLog.associate = (models) => {

  UserLog.belongsTo(models.User, {
    as: 'createdBy',
    foreignKey: 'created_by'
  });
};

module.exports = UserLog;
