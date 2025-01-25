"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Location extends Model {
    static associate(models) {
      Location.hasMany(models.User, { as: "users", foreignKey: "regionId" });
    }
  }
  Location.init(
    {
      name: DataTypes.STRING,
      location: DataTypes.STRING,
      managerIds: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        allowNull: true,
        defaultValue: [],
      },
    },
    {
      sequelize,
      modelName: "Location",
      paranoid: true,
      deletedAt: "deletedAt",
    }
  );
  return Location;
};
