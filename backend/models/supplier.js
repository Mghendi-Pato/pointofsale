"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Supplier extends Model {
    static associate(models) {
      Supplier.hasMany(models.Phone, {
        as: "phones",
        foreignKey: "supplierId",
      });
    }
  }
  Supplier.init(
    {
      name: DataTypes.STRING,
      email: { type: DataTypes.STRING, unique: true },
    },
    {
      sequelize,
      modelName: "Supplier",
      paranoid: true,
      deletedAt: "deletedAt",
    }
  );
  return Supplier;
};
