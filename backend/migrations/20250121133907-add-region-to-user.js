"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Users", "regionId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "Locations", // Name of the table being referenced
        key: "id", // Primary key in the referenced table
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Users", "regionId");
  },
};
