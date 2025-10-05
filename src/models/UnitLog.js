const { DataTypes, Model } = require("sequelize");
const sequelize = require("./sequelize");

class UnitLog extends Model {}

UnitLog.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    unit_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    asset_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    size: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    rent_price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    lamp: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    electric_socket: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    electrical_power: DataTypes.INTEGER,
    electrical_unit: {
      type: DataTypes.STRING,
      defaultValue: "Watt",
    },
    is_toilet_exist: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    is_deleted: DataTypes.BOOLEAN,
    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "UnitLog",
    tableName: "unit-logs",
    timestamps: false,
    indexes: [{ fields: ["code"] }, { fields: ["asset_id"] }],
  }
);

UnitLog.associate = (models) => {
  UnitLog.belongsTo(models.User, {
    foreignKey: 'created_by',
    as: 'createdBy',
  });
  UnitLog.belongsTo(models.Asset, {
    foreignKey: 'asset_id',
    as: 'asset',
  });
};

module.exports = UnitLog;
