'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('complaint_report_evidences', {
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
        onDelete: 'CASCADE'
      },
      url: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex('complaint_report_evidences', ['complaint_report_id']);
    await queryInterface.addIndex('complaint_report_evidences', ['created_at']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('complaint_report_evidences');
  },
};

