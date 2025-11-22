'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add paid_amount column to tenant_payment_logs table
    await queryInterface.addColumn('tenant_payment_logs', 'paid_amount', {
      type: Sequelize.FLOAT,
      allowNull: true,
      comment: 'Amount paid - will be filled when payment is made'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove paid_amount column
    await queryInterface.removeColumn('tenant_payment_logs', 'paid_amount');
  },
};

