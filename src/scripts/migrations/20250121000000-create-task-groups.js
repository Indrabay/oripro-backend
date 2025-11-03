'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('task_groups', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      start_time: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Start time in HH:mm format (e.g., 06:00 for morning shift)'
      },
      end_time: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'End time in HH:mm format (e.g., 14:00 for morning shift)'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      updated_by: {
        type: Sequelize.UUID,
        allowNull: true,
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

    await queryInterface.addIndex('task_groups', ['start_time', 'end_time']);
    await queryInterface.addIndex('task_groups', ['is_active']);
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('task_groups');
  },
};

