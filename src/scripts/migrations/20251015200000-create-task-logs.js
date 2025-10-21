'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('task_logs', {
      id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      task_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      name: Sequelize.STRING,
      is_main_task: Sequelize.BOOLEAN,
      is_need_validation: Sequelize.BOOLEAN,
      is_scan: Sequelize.BOOLEAN,
      scan_code: Sequelize.STRING,
      duration: Sequelize.INTEGER,
      asset_id: Sequelize.UUID,
      role_id: Sequelize.INTEGER,
      is_all_times: Sequelize.BOOLEAN,
      parent_task_id: Sequelize.BIGINT,
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      created_by: Sequelize.UUID,
    });
    await queryInterface.addIndex('task_logs', ['task_id']);
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('task_logs');
  },
};

