"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Phones", "supplierId", {
      type: Sequelize.INTEGER,
      references: {
        model: "Suppliers", // The table name of the Supplier model
        key: "id", // The primary key in the Supplier table
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
      allowNull: true, // Allows null to support phones without a supplier initially
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn("Phones", "supplierId");
  },
};
