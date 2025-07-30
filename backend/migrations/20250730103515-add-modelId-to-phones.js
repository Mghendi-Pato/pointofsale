"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn("Phones", "modelId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "PhoneModels", // Ensure this matches your table name
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.removeColumn("Phones", "modelId");
  },
};
