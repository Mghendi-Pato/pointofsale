"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("PoolMembers", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      poolId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Pools",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      managerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // Add a composite unique constraint to prevent duplicate associations
    await queryInterface.addConstraint("PoolMembers", {
      fields: ["poolId", "managerId"],
      type: "unique",
      name: "unique_pool_manager",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("PoolMembers");
  },
};
