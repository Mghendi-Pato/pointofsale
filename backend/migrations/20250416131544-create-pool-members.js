"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("PoolMembers", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      poolId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Pools",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      managerId: {
        type: Sequelize.INTEGER,
        unique: true, // Ensures a manager belongs to only one pool
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("PoolMembers");
  },
};
