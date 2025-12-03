'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('complaint_report_logs', {
      id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      complaint_report_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'complaint_reports',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Reference to complaint_report'
      },
      old_status: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Previous status: 0=pending, 1=in_progress, 2=resolved, 3=closed'
      },
      new_status: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'New status: 0=pending, 1=in_progress, 2=resolved, 3=closed'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'Notes about the status change'
      },
      photo_evidence_url: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'URL to photo evidence for the status change'
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'User who made the status change'
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // Add indexes
    await queryInterface.addIndex('complaint_report_logs', ['complaint_report_id']);
    await queryInterface.addIndex('complaint_report_logs', ['created_at']);
    await queryInterface.addIndex('complaint_report_logs', ['created_by']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('complaint_report_logs');
  },
};

