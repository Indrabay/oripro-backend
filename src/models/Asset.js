const { DataTypes, Model } = require("sequelize");
const sequelize = require("./sequelize");

const AssetTypeStrToInt = {
  ESTATE: 1,
  OFFICE: 2,
  WAREHOUSE: 3,
  SPORT: 4,
  ENTERTAINMENTRESTAURANT: 5,
  RESIDENCE: 6,
  MALL: 7,
  SUPPORTFACILITYMOSQUEITAL: 8,
  PARKINGLOT: 9,
};

const AssetTypeIntToStr = {
  1: "ESTATE",
  2: "OFFICE",
  3: "WAREHOUSE",
  4: "SPORT",
  5: "ENTERTAINMENTRESTAURANT",
  6: "RESIDENCE",
  7: "MALL",
  8: "SUPPORTFACILITYMOSQUEITAL",
  9: "PARKINGLOT",
};

const AssetStatusIntToStr = {
  1: 'active',
  0: 'inactive'
}

const AssetStatusStrToInt = {
  'active': 1,
  'inactive': 0
}

class Asset extends Model {}

Asset.init(
  {
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
    area: DataTypes.DECIMAL(10, 2),
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
  },
  {
    sequelize,
    modelName: "Asset",
    tableName: "assets",
    timestamps: false,
    indexes: [{ fields: ["code"] }, { fields: ["asset_type"] }],
  }
);

Asset.associate = (models) => {
  Asset.belongsTo(models.User, {
    foreignKey: "created_by",
    as: "createdBy",
  });
  Asset.belongsTo(models.User, {
    foreignKey: "updated_by",
    as: "updatedBy",
  });
};

module.exports = { Asset, AssetTypeIntToStr, AssetTypeStrToInt, AssetStatusIntToStr, AssetStatusStrToInt };
