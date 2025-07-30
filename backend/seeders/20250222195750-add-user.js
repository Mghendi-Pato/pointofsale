"use strict";
const bcrypt = require("bcrypt");

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash("Amerika8", 10);
    return queryInterface.bulkInsert("Users", [
      {
        firstName: "Mwamburi",
        lastName: "Patrick",
        email: "mwamburipatrick8@gmail.com",
        password: hashedPassword,
        phone: "0706465398",
        status: "active",
        role: "super admin",
        regionId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("Users", {
      email: "mwamburipatrick8@gmail.com",
    });
  },
};
