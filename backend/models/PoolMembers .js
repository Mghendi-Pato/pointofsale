"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class PoolMembers extends Model {
    static associate(models) {
      // Relationships are already defined in the User and Pool models
    }
  }
  PoolMembers.init(
    {
      poolId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Pools",
          key: "id",
        },
      },
      managerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
    },
    {
      sequelize,
      modelName: "PoolMembers",
      tableName: "PoolMembers",
    }
  );
  return PoolMembers;
};
