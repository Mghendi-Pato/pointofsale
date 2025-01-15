"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Stock extends Model {
    static associate(models) {
      Stock.hasMany(models.Phone, { as: "phones", foreignKey: "stockId" });
      Stock.belongsTo(models.User, { as: "manager", foreignKey: "managerId" });
    }
  }
  Stock.init(
    {
      dateReceived: DataTypes.DATE,
      dateOfCompletion: DataTypes.DATE,
      status: {
        type: DataTypes.ENUM("active", "danger", "suspended", "complete"),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Stock",
    }
  );
  return Stock;
};
