// Migration for Asset model
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('assets', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      code: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      description: Sequelize.TEXT,
      asset_type: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      status: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      address: Sequelize.STRING(500),
      area: Sequelize.DECIMAL(10,2),
      longitude: Sequelize.DOUBLE,
      latitude: Sequelize.DOUBLE,
      created_by: Sequelize.UUID,
      updated_by: Sequelize.UUID,
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
    await queryInterface.addIndex('assets', ['code']);
    await queryInterface.addIndex('assets', ['asset_type']);
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('assets');
  },
};
