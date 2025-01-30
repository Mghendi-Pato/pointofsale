"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Phones", "company", {
      type: Sequelize.STRING,
      allowNull: true, // Company will be stored only when sold
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Phones", "company");
  },
};
