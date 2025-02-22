"use strict";
const bcrypt = require("bcrypt");

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash("WeakPassword", 10);
    return queryInterface.bulkInsert("Users", [
      {
        firstName: "Roberto",
        lastName: "Owaka",
        email: "jroberto950@gmail.com",
        password: hashedPassword,
        ID: "28015967",
        phone: "0720390041",
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
      email: "jroberto950@gmail.com",
    });
  },
};
