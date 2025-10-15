const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const AttendanceModel = sequelize.define('Attendance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  asset_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  check_in_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  check_out_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  check_in_latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  check_in_longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  check_out_latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  check_out_longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('checked_in', 'checked_out'),
    allowNull: false,
    defaultValue: 'checked_in'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Attendance',
  tableName: 'attendances',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = AttendanceModel;