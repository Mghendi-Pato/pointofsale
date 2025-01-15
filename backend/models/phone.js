"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Phone extends Model {
    static associate(models) {
      Phone.belongsTo(models.Supplier, {
        as: "supplier",
        foreignKey: "supplierId",
      });
      Phone.belongsTo(models.Stock, { as: "stock", foreignKey: "stockId" });
      Phone.belongsTo(models.Customer, {
        as: "customer",
        foreignKey: "customerId",
      });
    }
  }
  Phone.init(
    {
      imei: { type: DataTypes.STRING, unique: true },
      name: DataTypes.STRING,
      purchasePrice: DataTypes.FLOAT,
      sellingPrice: DataTypes.FLOAT,
      buyDate: DataTypes.DATE,
      saleDate: DataTypes.DATE,
      details: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Phone",
    }
  );
  return Phone;
};
