'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_assets', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      asset_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
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

    await queryInterface.addIndex('user_assets', ['user_id']);
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('user_assets');
  }
}