"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.belongsTo(models.Shop, { as: "shop", foreignKey: "shopId" });
      User.belongsTo(models.Stock, { as: "stock", foreignKey: "stockId" });
      User.hasMany(models.Shop, { as: "manager", foreignKey: "managerId" });
    }
  }
  User.init(
    {
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      email: { type: DataTypes.STRING, unique: true, allowNull: true },
      password: DataTypes.STRING,
      ID: { type: DataTypes.STRING, unique: true },
      phone: DataTypes.STRING,
      role: {
        type: DataTypes.ENUM("super admin", "admin", "manager"),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "User",
      paranoid: true,
      deletedAt: "deletedAt",
    }
  );
  return User;
};
