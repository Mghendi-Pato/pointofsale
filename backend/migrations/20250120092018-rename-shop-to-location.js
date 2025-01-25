"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Rename Shop table to Location
    await queryInterface.renameTable("Shops", "Locations");

    // Rename shopId column in Users table to regionId
    await queryInterface.renameColumn("Users", "shopId", "regionId");

    // Update foreign key reference in Users table
    await queryInterface.changeColumn("Users", "regionId", {
      type: Sequelize.INTEGER,
      references: {
        model: "Locations", // New table name
        key: "id",
      },
      allowNull: true,
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface, Sequelize) {
    // Rename Location table back to Shop
    await queryInterface.renameTable("Locations", "Shops");

    // Rename regionId column in Users table back to shopId
    await queryInterface.renameColumn("Users", "regionId", "shopId");

    // Revert foreign key reference in Users table
    await queryInterface.changeColumn("Users", "shopId", {
      type: Sequelize.INTEGER,
      references: {
        model: "Shops", // Original table name
        key: "id",
      },
      allowNull: true,
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },
};
