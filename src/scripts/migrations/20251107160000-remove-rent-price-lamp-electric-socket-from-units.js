'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove columns from units table
    await queryInterface.removeColumn('units', 'rent_price');
    await queryInterface.removeColumn('units', 'lamp');
    await queryInterface.removeColumn('units', 'electric_socket');
  },

  down: async (queryInterface, Sequelize) => {
    // Add back the columns
    await queryInterface.addColumn('units', 'rent_price', {
      type: Sequelize.FLOAT,
      allowNull: true, // Allow null initially for rollback compatibility
    });
    await queryInterface.addColumn('units', 'lamp', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });
    await queryInterface.addColumn('units', 'electric_socket', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });
  },
};

