"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Shop extends Model {
    static associate(models) {
      Shop.belongsTo(models.User, { as: "manager", foreignKey: "managerId" });
    }
  }
  Shop.init(
    {
      name: DataTypes.STRING,
      location: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Shop",
      paranoid: true,
      deletedAt: "deletedAt",
    }
  );
  return Shop;
};
