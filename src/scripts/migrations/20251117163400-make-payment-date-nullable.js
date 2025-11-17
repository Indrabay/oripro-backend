'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Change payment_date column to allow NULL
    await queryInterface.changeColumn('tenant_payment_logs', 'payment_date', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Payment date - will be filled when payment is made'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert payment_date column to NOT NULL
    // First, set NULL values to a default date (e.g., created_at or current date)
    await queryInterface.sequelize.query(`
      UPDATE tenant_payment_logs 
      SET payment_date = COALESCE(payment_date, created_at, CURRENT_TIMESTAMP)
      WHERE payment_date IS NULL;
    `);
    
    await queryInterface.changeColumn('tenant_payment_logs', 'payment_date', {
      type: Sequelize.DATE,
      allowNull: false,
    });
  },
};

