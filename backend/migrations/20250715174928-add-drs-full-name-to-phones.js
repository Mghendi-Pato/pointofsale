"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Phones", "drsFullName", {
      type: Sequelize.STRING,
      allowNull: true,
      comment: "DRS Full Name - two names separated by space",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Phones", "drsFullName");
  },
};
