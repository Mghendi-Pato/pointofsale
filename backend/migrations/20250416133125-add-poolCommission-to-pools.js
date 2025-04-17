"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Pools", "poolCommission", {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0, // Or allowNull: true if you prefer
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Pools", "poolCommission");
  },
};
