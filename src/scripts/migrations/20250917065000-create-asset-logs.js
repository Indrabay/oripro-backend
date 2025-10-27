'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('asset_logs', {
      id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      asset_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      action: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Action: CREATE, UPDATE, DELETE'
      },
      old_data: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Previous data before change'
      },
      new_data: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'New data after change'
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
    await queryInterface.addIndex('asset_logs', ['asset_id']);
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('asset_logs');
  },
};
