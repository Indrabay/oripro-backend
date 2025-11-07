'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove index on evidence_type
    await queryInterface.removeIndex('user_task_evidences', ['evidence_type']);
    
    // Remove old columns
    await queryInterface.removeColumn('user_task_evidences', 'evidence_type');
    await queryInterface.removeColumn('user_task_evidences', 'file_path');
    await queryInterface.removeColumn('user_task_evidences', 'file_name');
    await queryInterface.removeColumn('user_task_evidences', 'file_size');
    await queryInterface.removeColumn('user_task_evidences', 'mime_type');
    await queryInterface.removeColumn('user_task_evidences', 'scan_code');
    await queryInterface.removeColumn('user_task_evidences', 'latitude');
    await queryInterface.removeColumn('user_task_evidences', 'longitude');
    await queryInterface.removeColumn('user_task_evidences', 'description');
    
    // Add new url column
    await queryInterface.addColumn('user_task_evidences', 'url', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove url column
    await queryInterface.removeColumn('user_task_evidences', 'url');
    
    // Add back old columns
    await queryInterface.addColumn('user_task_evidences', 'evidence_type', {
      type: Sequelize.ENUM('photo', 'video', 'scan', 'text', 'file'),
      allowNull: false,
    });
    await queryInterface.addColumn('user_task_evidences', 'file_path', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('user_task_evidences', 'file_name', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('user_task_evidences', 'file_size', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('user_task_evidences', 'mime_type', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('user_task_evidences', 'scan_code', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('user_task_evidences', 'latitude', {
      type: Sequelize.DOUBLE,
      allowNull: true,
    });
    await queryInterface.addColumn('user_task_evidences', 'longitude', {
      type: Sequelize.DOUBLE,
      allowNull: true,
    });
    await queryInterface.addColumn('user_task_evidences', 'description', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    
    // Add back index on evidence_type
    await queryInterface.addIndex('user_task_evidences', ['evidence_type']);
  },
};

