"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class PhoneModel extends Model {
    static associate(models) {
      PhoneModel.hasMany(models.Phone, {
        as: "phones",
        foreignKey: "modelId",
      });
    }
  }

  PhoneModel.init(
    {
      make: { type: DataTypes.STRING, allowNull: false },
      model: { type: DataTypes.STRING, allowNull: false },

      commissions: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: [],
      },
    },
    {
      sequelize,
      modelName: "PhoneModel",
      paranoid: true,
      timestamps: true,
    }
  );

  return PhoneModel;
};
