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
      Phone.belongsTo(models.User, {
        as: "manager",
        foreignKey: "managerId",
      });
      Phone.belongsTo(models.PhoneModel, {
        as: "phoneModel",
        foreignKey: "modelId",
      });
    }
  }

  Phone.init(
    {
      imei: { type: DataTypes.STRING, unique: true },
      purchasePrice: DataTypes.FLOAT,
      buyDate: DataTypes.DATE,
      sellingPrice: { type: DataTypes.FLOAT, allowNull: true },
      saleDate: { type: DataTypes.DATE, allowNull: true },
      supplierId: DataTypes.INTEGER,
      modelId: {
        type: DataTypes.INTEGER,
        references: {
          model: "PhoneModels",
          key: "id",
        },
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("active", "suspended", "sold", "lost"),
        allowNull: false,
        defaultValue: "active",
      },
      managerId: {
        type: DataTypes.INTEGER,
        references: {
          model: "Users",
          key: "id",
        },
        allowNull: true,
      },
      capacity: { type: DataTypes.STRING, allowNull: true },
      agentCommission: { type: DataTypes.FLOAT, allowNull: true },
      company: { type: DataTypes.STRING, allowNull: true },
      customerId: {
        type: DataTypes.INTEGER,
        references: {
          model: "Customers",
          key: "id",
        },
        allowNull: true,
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
    },
    {
      sequelize,
      modelName: "Phone",
    }
  );

  return Phone;
};
