'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Track whether a payment reminder email has been sent to avoid spamming
    await queryInterface.addColumn('tenant_payment_logs', 'reminder_sent_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'When the payment reminder email was sent',
    });

    await queryInterface.addIndex('tenant_payment_logs', ['reminder_sent_at']);
  },

  down: async (queryInterface) => {
    try {
      await queryInterface.removeIndex('tenant_payment_logs', ['reminder_sent_at']);
    } catch (_e) {
      // ignore
    }
    await queryInterface.removeColumn('tenant_payment_logs', 'reminder_sent_at');
  }
};


