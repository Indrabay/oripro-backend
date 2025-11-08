'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('complaint_reports', {
      id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      type: {
        type: Sequelize.ENUM('complaint', 'report'),
        allowNull: false,
        comment: 'complaint if reporter is tenant, report if reporter is internal (admin, super_admin, security, cleaning)'
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      reporter_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'User ID of the person making the complaint/report'
      },
      tenant_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'tenants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Tenant ID (only for complaints, null for reports)'
      },
      status: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
        comment: 'Status: 0=pending, 1=in_progress, 2=resolved, 3=closed'
      },
      priority: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        allowNull: false,
        comment: 'Priority: 0=low, 1=medium, 2=high, 3=urgent'
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
      updated_by: {
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
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // Add indexes
    await queryInterface.addIndex('complaint_reports', ['type']);
    await queryInterface.addIndex('complaint_reports', ['status']);
    await queryInterface.addIndex('complaint_reports', ['priority']);
    await queryInterface.addIndex('complaint_reports', ['reporter_id']);
    await queryInterface.addIndex('complaint_reports', ['tenant_id']);
    await queryInterface.addIndex('complaint_reports', ['created_at']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('complaint_reports');
  },
};

