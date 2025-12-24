'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add payment_status column to tenants table
    await queryInterface.addColumn('tenants', 'payment_status', {
      type: Sequelize.ENUM('paid', 'scheduled', 'reminder_needed', 'overdue'),
      allowNull: true,
      defaultValue: 'scheduled',
      comment: 'Payment status: paid, scheduled, reminder_needed, overdue'
    });

    // Add index for better query performance
    try {
      await queryInterface.addIndex('tenants', ['payment_status']);
    } catch (error) {
      if (!error.message.includes('already exists')) {
        throw error;
      }
    }
  },

  down: async (queryInterface) => {
    try {
      await queryInterface.removeIndex('tenants', ['payment_status']);
    } catch (_e) {
      // ignore
    }
    await queryInterface.removeColumn('tenants', 'payment_status');
  }
};

