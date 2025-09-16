// Migration for AssetAdmin model
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('asset_admins', {
      asset_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        references: { model: 'assets', key: 'id' },
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        references: { model: 'users', key: 'id' },
      },
    });
    await queryInterface.addIndex('asset_admins', ['user_id']);
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('asset_admins');
  },
};
