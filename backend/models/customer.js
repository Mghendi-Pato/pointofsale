"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Customer extends Model {
    static associate(models) {
      Customer.hasMany(models.Phone, {
        as: "phones",
        foreignKey: "customerId",
      });
    }
  }
  Customer.init(
    {
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      nkPhone: DataTypes.STRING,
      nkEmail: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Customer",
      paranoid: true,
      deletedAt: "deletedAt",
    }
  );
  return Customer;
};
