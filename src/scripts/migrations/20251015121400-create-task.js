'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('tasks', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      is_main_task: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      is_need_validation: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      is_scan: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      scan_code: Sequelize.STRING,
      duration: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      asset_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      role_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      is_all_times: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      parent_task_id: Sequelize.BIGINT,
      created_by: Sequelize.UUID,
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_by: Sequelize.UUID,
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex('tasks', ['asset_id', 'role_id'])
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('tasks');
  }
};
