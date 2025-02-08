"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkUpdate(
      "Users",
      { lastName: "Naliyanya", role: "super admin" },
      { email: "nalyanyamaxwell@gmail.com" }
    );
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkUpdate(
      "Users",
      { lastName: null, role: "user" },
      { email: "nalyanyamaxwell@gmail.com" }
    );
  },
};
