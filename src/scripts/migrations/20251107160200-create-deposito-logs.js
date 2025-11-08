'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('deposito_logs', {
      id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      tenant_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'tenants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      old_deposit: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      new_deposit: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      reason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // Add indexes
    await queryInterface.addIndex('deposito_logs', ['tenant_id']);
    await queryInterface.addIndex('deposito_logs', ['created_at']);
    await queryInterface.addIndex('deposito_logs', ['created_by']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('deposito_logs');
  },
};

