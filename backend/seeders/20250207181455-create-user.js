"use strict";
const bcrypt = require("bcrypt");

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash("a29778294", 10);
    return queryInterface.bulkInsert("Users", [
      {
        firstName: "Nilkanth",
        lastName: "Chudasama",
        email: "nilkanthchudasama13@gmail.com",
        password: hashedPassword,
        phone: "0720453777",
        role: "super admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("Users", {
      email: "nilkanthchudasama13@gmail.com",
    });
  },
};
