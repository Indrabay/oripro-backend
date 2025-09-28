const { DataTypes, Model } = require('sequelize');
const sequelize = require('./sequelize');

class UnitAttachment extends Model {};

UnitAttachment.init({
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  unit_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  sequelize,
  modelName: 'UnitAttachment',
  tableName: 'unit-attachments',
  timestamps: false,
  indexes: [
    { fields: ['unit_id'] },
  ],
});

module.exports = UnitAttachment;