"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove unnecessary columns
    await queryInterface.removeColumn("Customers", "customerId");
    await queryInterface.removeColumn("Customers", "nkEmail");

    // Add new columns
    await queryInterface.addColumn("Customers", "phoneNumber", {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    });

    await queryInterface.addColumn("Customers", "ID", {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    });

    await queryInterface.addColumn("Customers", "nkFirstName", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("Customers", "nkLastName", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Re-add removed columns
    await queryInterface.addColumn("Customers", "customerId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      unique: true,
    });

    await queryInterface.addColumn("Customers", "nkEmail", {
      type: Sequelize.STRING,
    });

    // Remove newly added columns
    await queryInterface.removeColumn("Customers", "phoneNumber");
    await queryInterface.removeColumn("Customers", "ID");
    await queryInterface.removeColumn("Customers", "nkFirstName");
    await queryInterface.removeColumn("Customers", "nkLastName");
  },
};
