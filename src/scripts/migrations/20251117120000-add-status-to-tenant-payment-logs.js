'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add status column to tenant_payment_logs table
    await queryInterface.addColumn('tenant_payment_logs', 'status', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0, // 0 = unpaid
      comment: 'Status: 0=unpaid, 1=paid, 2=expired'
    });

    // Add index on status for better query performance
    await queryInterface.addIndex('tenant_payment_logs', ['status']);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove index first
    try {
      await queryInterface.removeIndex('tenant_payment_logs', ['status']);
    } catch (error) {
      // Index might not exist, ignore error
    }
    
    // Remove status column
    await queryInterface.removeColumn('tenant_payment_logs', 'status');
  },
};

