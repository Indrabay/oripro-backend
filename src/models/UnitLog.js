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
  },
  {
    sequelize,
    modelName: "UnitLog",
    tableName: "unit_logs",
    timestamps: false,
    indexes: [{ fields: ["unit_id"] }],
  }
);

UnitLog.associate = (models) => {
  UnitLog.belongsTo(models.User, {
    foreignKey: 'created_by',
    as: 'createdBy',
  });
};

module.exports = UnitLog;
