"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn("Suppliers", "email", "phone");
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn("Suppliers", "phone", "email");
  },
};
