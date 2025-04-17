"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Pool extends Model {
    static associate(models) {
      Pool.belongsTo(models.User, {
        as: "superManager",
        foreignKey: "superManagerId",
      });
      Pool.belongsToMany(models.User, {
        through: models.PoolMembers,
        as: "poolMembers", // Changed from "members" to "poolMembers"
        foreignKey: "poolId",
        otherKey: "managerId",
      });
    }
  }
  Pool.init(
    {
      name: { type: DataTypes.STRING, allowNull: false, unique: true },
      superManagerId: { type: DataTypes.INTEGER, allowNull: true },
      poolCommission: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      members: {
        type: DataTypes.TEXT, // Keep this as is
        allowNull: true,
        get() {
          const value = this.getDataValue("members");
          return value ? JSON.parse(value) : [];
        },
        set(value) {
          this.setDataValue("members", JSON.stringify(value));
        },
      },
    },
    {
      sequelize,
      modelName: "Pool",
    }
  );
  return Pool;
};
