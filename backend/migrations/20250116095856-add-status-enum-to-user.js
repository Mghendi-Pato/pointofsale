"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Users", "status", {
      type: Sequelize.ENUM("active", "suspended"), // ENUM definition
      allowNull: false,
      defaultValue: "active", // Default value for existing rows
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the ENUM column and its values
    await queryInterface.removeColumn("Users", "status");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_Users_status";'
    ); // Remove ENUM type
  },
};
