module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Locations", "deletedAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Locations", "deletedAt");
  },
};
