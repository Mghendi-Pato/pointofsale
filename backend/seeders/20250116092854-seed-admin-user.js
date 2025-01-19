const bcrypt = require("bcrypt");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = await bcrypt.hash("password123", 10);

    await queryInterface.bulkInsert("Users", [
      {
        firstName: "Peter",
        lastName: "Paul",
        email: "pau@email.com",
        password: hashedPassword,
        ID: "34567854",
        phone: "0798765646",
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("Users", {
      email: "pau@email.com",
    });
  },
};
