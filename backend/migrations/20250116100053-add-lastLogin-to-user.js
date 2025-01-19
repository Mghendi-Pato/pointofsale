"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Users", "lastLogin", {
      type: Sequelize.DATE, // Store date and time of last login
      allowNull: true, // Allow null if the user hasn't logged in yet
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Users", "lastLogin");
  },
};
