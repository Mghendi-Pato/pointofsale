"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Suppliers", "phones", {
      type: Sequelize.ARRAY(Sequelize.INTEGER),
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn("Suppliers", "phones");
  },
};
