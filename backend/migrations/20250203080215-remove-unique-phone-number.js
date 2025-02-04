module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint(
      "Customers",
      "Customers_phoneNumber_key"
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint("Customers", {
      fields: ["phoneNumber"],
      type: "unique",
      name: "Customers_phoneNumber_key",
    });
  },
};
