"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(
      "ALTER TYPE \"enum_Phones_status\" ADD VALUE 'reconcile';"
    );
  },

  down: async (queryInterface, Sequelize) => {
    // ENUM types in Postgres cannot remove values, so you may need a workaround.
    // One option is to recreate the ENUM without 'reconcile' (but this is tricky in production).
    // Here's a simple workaround that does nothing on rollback:

    return Promise.resolve();
  },
};
