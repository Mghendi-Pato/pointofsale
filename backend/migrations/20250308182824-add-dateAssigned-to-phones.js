module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn("Phones", "dateAssigned", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("Phones", "dateAssigned");
  },
};
