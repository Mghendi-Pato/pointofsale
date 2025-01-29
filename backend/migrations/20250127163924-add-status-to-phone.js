"use strict";

/** @type {import('sequelize').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add the 'status' column to the 'Phone' table
    await queryInterface.addColumn("Phones", "status", {
      type: Sequelize.ENUM("active", "suspended", "sold", "lost"),
      allowNull: false, // Assuming this field is required
      defaultValue: "active", // You can set a default value if needed
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove the 'status' column in case of a rollback
    await queryInterface.removeColumn("Phones", "status");

    // Drop the ENUM type for status if no longer needed
    await queryInterface.sequelize.query('DROP TYPE "enum_Phones_status"');
  },
};
