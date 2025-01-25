"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.belongsTo(models.Location, { as: "region", foreignKey: "regionId" });
      User.belongsTo(models.Stock, { as: "stock", foreignKey: "stockId" });
      User.hasMany(models.Location, { as: "manager", foreignKey: "managerId" });
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
      status: {
        type: DataTypes.ENUM("active", "suspended"),
        allowNull: false,
        defaultValue: "active",
      },
      role: {
        type: DataTypes.ENUM("super admin", "admin", "manager"),
        allowNull: true,
      },
      lastLogin: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      regionId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Location",
          key: "id",
        },
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
