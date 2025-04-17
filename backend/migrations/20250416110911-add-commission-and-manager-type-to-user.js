"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Users", "commission", {
      type: Sequelize.FLOAT,
      allowNull: true,
    });

    await queryInterface.addColumn("Users", "managerType", {
      type: Sequelize.ENUM("manager", "super manager"),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Users", "commission");

    await queryInterface.removeColumn("Users", "managerType");

    // Cleanup ENUM type in Postgres
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_Users_managerType";'
    );
  },
};
