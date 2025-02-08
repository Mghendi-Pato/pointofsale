"use strict";
const bcrypt = require("bcrypt");

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash("Sup3rS3cret", 10);
    return queryInterface.bulkInsert("Users", [
      {
        firstName: "Maxwel",
        lastName: null, // No last name provided
        email: "nalyanyamaxwell@gmail.com",
        password: hashedPassword,
        phone: "0700110360",
        role: "user", // Change role if needed
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("Users", {
      email: "nalyanyamaxwell@gmail.com",
    });
  },
};
