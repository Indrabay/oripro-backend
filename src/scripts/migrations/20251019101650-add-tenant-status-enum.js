'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Update tenant status column to use enum with new values
    await queryInterface.changeColumn('tenants', 'status', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 2, // pending
      comment: 'Status: 0=inactive, 1=active, 2=pending, 3=expired, 4=terminated, 5=blacklisted'
    });
  },

  async down (queryInterface, Sequelize) {
    // Revert to original status values
    await queryInterface.changeColumn('tenants', 'status', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1, // active
      comment: 'Status: 0=inactive, 1=active'
    });
  }
};
