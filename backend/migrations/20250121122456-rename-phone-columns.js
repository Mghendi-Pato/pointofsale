module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Rename columns
    await queryInterface.renameColumn("Phones", "name", "make");
    await queryInterface.renameColumn("Phones", "details", "model");
  },

  down: async (queryInterface, Sequelize) => {
    // Revert column names
    await queryInterface.renameColumn("Phones", "make", "name");
    await queryInterface.renameColumn("Phones", "model", "details");
  },
};
