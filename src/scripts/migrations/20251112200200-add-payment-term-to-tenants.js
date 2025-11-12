'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add payment_term column to tenants table
    await queryInterface.addColumn('tenants', 'payment_term', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'Payment term: 0=year, 1=month'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove payment_term column
    await queryInterface.removeColumn('tenants', 'payment_term');
  },
};

