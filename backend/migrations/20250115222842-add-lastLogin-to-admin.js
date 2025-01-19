// migrations/YYYYMMDDHHMMSS-add-lastLogin-to-admin.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Users", "lastLogin", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn("Users", "lastLogin");
  },
};
