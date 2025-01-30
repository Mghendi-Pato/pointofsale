module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Customers", "deletedAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Customers", "deletedAt");
  },
};
