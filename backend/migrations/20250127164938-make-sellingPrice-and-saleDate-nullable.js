"use strict";

/** @type {import('sequelize').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Make 'sellingPrice' and 'saleDate' nullable in the 'Phone' table
    await queryInterface.changeColumn("Phones", "sellingPrice", {
      type: Sequelize.FLOAT,
      allowNull: true, // Allow null values
    });

    await queryInterface.changeColumn("Phones", "saleDate", {
      type: Sequelize.DATE,
      allowNull: true, // Allow null values
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert the changes in case of a rollback
    await queryInterface.changeColumn("Phones", "sellingPrice", {
      type: Sequelize.FLOAT,
      allowNull: false, // Make it non-nullable
    });

    await queryInterface.changeColumn("Phones", "saleDate", {
      type: Sequelize.DATE,
      allowNull: false, // Make it non-nullable
    });
  },
};
