"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("PhoneModels", "commissions", {
      type: Sequelize.JSONB, // Use JSONB for PostgreSQL, JSON for MySQL
      allowNull: true,
      defaultValue: [],
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("PhoneModels", "commissions");
  },
};
