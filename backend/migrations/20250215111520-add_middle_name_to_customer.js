"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Customers", "middleName", {
      type: Sequelize.STRING,
      allowNull: true, // Optional field
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Customers", "middleName");
  },
};
