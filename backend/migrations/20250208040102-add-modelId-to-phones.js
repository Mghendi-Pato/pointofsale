"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Phones", "modelId", {
      type: Sequelize.INTEGER,
      references: {
        model: "PhoneModels",
        key: "id",
      },
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Phones", "modelId");
  },
};
