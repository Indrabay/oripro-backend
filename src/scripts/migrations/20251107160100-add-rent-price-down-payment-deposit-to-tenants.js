'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add new columns to tenants table
    await queryInterface.addColumn('tenants', 'rent_price', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    await queryInterface.addColumn('tenants', 'down_payment', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    await queryInterface.addColumn('tenants', 'deposit', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove columns
    await queryInterface.removeColumn('tenants', 'rent_price');
    await queryInterface.removeColumn('tenants', 'down_payment');
    await queryInterface.removeColumn('tenants', 'deposit');
  },
};

