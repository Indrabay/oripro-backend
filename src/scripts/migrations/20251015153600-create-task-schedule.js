"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("task_schedules", {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      task_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      day_of_week: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'all',
      },
      time: Sequelize.STRING,
      created_by: Sequelize.UUID,
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex('task_schedules', ['task_id', 'day_of_week', 'time']);
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('task_schedules');
  }
};
