'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add status column to units table
    await queryInterface.addColumn('units', 'status', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0, // 0 = available
      comment: 'Status: 0=available, 1=occupied, 2=maintenance, 3=reserved, 4=inactive, 5=out_of_order'
    });

    // Add index on status for better query performance
    await queryInterface.addIndex('units', ['status']);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove index first
    try {
      await queryInterface.removeIndex('units', ['status']);
    } catch (error) {
      // Index might not exist, ignore error
    }
    
    // Remove status column
    await queryInterface.removeColumn('units', 'status');
  },
};

