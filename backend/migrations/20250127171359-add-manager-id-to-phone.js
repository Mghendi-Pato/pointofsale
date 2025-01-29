"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Phones", "managerId", {
      type: Sequelize.INTEGER,
      allowNull: true, // You can make this non-nullable if you prefer
      references: {
        model: "Users", // The table name for the User model
        key: "id", // The primary key of the User model
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Phones", "managerId");
  },
};
