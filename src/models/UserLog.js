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
  email: {
    type: DataTypes.STRING(320),
    allowNull: false,
    unique: true,
  },
  gender: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  name: DataTypes.STRING,
  role_id: DataTypes.INTEGER,
  status: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  created_by: DataTypes.UUID,
}, {
  sequelize,
  modelName: 'UserLog',
  tableName: 'user_logs',
  timestamps: false,
});

UserLog.associate = (models) => {
  UserLog.belongsTo(models.Role, {
    as: 'role',
    foreignKey: 'role_id',
  });

  UserLog.belongsTo(models.User, {
    as: 'createdBy',
    foreignKey: 'created_by'
  });
};

module.exports = UserLog;
