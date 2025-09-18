const { DataTypes, Model } = require('sequelize');
const sequelize = require('./sequelize');

const ESTATE = 1;
const OFFICE = 2;
const WAREHOUSE = 3;
const SPORT = 4;
const ENTERTAINMENTRESTAURANT = 5;
const RESIDENCE = 6;
const MALL = 7;
const SUPPORTFACILITYMOSQUEITAL = 8;
const PARKINGLOT = 9;

class Asset extends Model {}

Asset.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  code: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  description: DataTypes.TEXT,
  asset_type: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  address: DataTypes.STRING(500),
  area: DataTypes.DECIMAL(10,2),
  longitude: DataTypes.DOUBLE,
  latitude: DataTypes.DOUBLE,
  created_by: DataTypes.UUID,
  updated_by: DataTypes.UUID,
  is_deleted: DataTypes.BOOLEAN,
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
  modelName: 'Asset',
  tableName: 'assets',
  timestamps: false,
  indexes: [
    { fields: ['code'] },
    { fields: ['assert_type'] },
  ],
});

module.exports = { Asset, ESTATE, OFFICE, WAREHOUSE, SPORT, ENTERTAINMENTRESTAURANT, RESIDENCE, MALL, SUPPORTFACILITYMOSQUEITAL, PARKINGLOT };
