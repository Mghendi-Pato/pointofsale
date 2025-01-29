"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Supplier extends Model {
    static associate(models) {
      // Define association with Phone
      Supplier.hasMany(models.Phone, {
        as: "phones",
        foreignKey: "supplierId",
      });
    }
  }
  Supplier.init(
    {
      name: DataTypes.STRING,
      phone: { type: DataTypes.STRING, unique: true },
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
