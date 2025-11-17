'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add payment_deadline column to tenant_payment_logs table
    await queryInterface.addColumn('tenant_payment_logs', 'payment_deadline', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Payment deadline date for this payment'
    });

    // Add index on payment_deadline for better query performance
    await queryInterface.addIndex('tenant_payment_logs', ['payment_deadline']);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove index first
    try {
      await queryInterface.removeIndex('tenant_payment_logs', ['payment_deadline']);
    } catch (error) {
      // Index might not exist, ignore error
    }
    
    // Remove payment_deadline column
    await queryInterface.removeColumn('tenant_payment_logs', 'payment_deadline');
  },
};

