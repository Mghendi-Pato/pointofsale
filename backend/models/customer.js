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
      firstName: { type: DataTypes.STRING, allowNull: false },
      middleName: { type: DataTypes.STRING, allowNull: true }, // Optional Middle Name
      lastName: { type: DataTypes.STRING, allowNull: false },
      phoneNumber: { type: DataTypes.STRING, allowNull: false, unique: false },
      ID: {
        type: DataTypes.BIGINT,
        allowNull: false,
        unique: true,
      },
      nkFirstName: { type: DataTypes.STRING, allowNull: true },
      nkLastName: { type: DataTypes.STRING, allowNull: true },
      nkPhone: { type: DataTypes.STRING, allowNull: false },
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
