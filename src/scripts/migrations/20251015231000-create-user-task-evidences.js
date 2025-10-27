'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_task_evidences', {
      id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      user_task_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'user_tasks',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      evidence_type: {
        type: Sequelize.ENUM('photo', 'video', 'scan', 'text', 'file'),
        allowNull: false,
      },
      file_path: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      file_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      file_size: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      mime_type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      scan_code: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      latitude: {
        type: Sequelize.DOUBLE,
        allowNull: true,
      },
      longitude: {
        type: Sequelize.DOUBLE,
        allowNull: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex('user_task_evidences', ['user_task_id']);
    await queryInterface.addIndex('user_task_evidences', ['evidence_type']);
    await queryInterface.addIndex('user_task_evidences', ['created_at']);
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('user_task_evidences');
  },
};
