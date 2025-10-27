'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create attendances table without foreign key constraints first
    await queryInterface.createTable('attendances', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false
      },
      asset_id: {
        type: Sequelize.UUID,
        allowNull: false
      },
      check_in_time: {
        type: Sequelize.DATE,
        allowNull: true
      },
      check_out_time: {
        type: Sequelize.DATE,
        allowNull: true
      },
      check_in_latitude: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: true
      },
      check_in_longitude: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: true
      },
      check_out_latitude: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: true
      },
      check_out_longitude: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('checked_in', 'checked_out'),
        allowNull: false,
        defaultValue: 'checked_in'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Add indexes for better performance
    await queryInterface.addIndex('attendances', ['user_id']);
    await queryInterface.addIndex('attendances', ['asset_id']);
    await queryInterface.addIndex('attendances', ['created_at']);
    await queryInterface.addIndex('attendances', ['status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('attendances');
  }
};
