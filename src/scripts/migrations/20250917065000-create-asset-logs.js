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
      name: Sequelize.STRING,
      code: Sequelize.STRING(100),
      description: Sequelize.TEXT,
      asset_type: Sequelize.INTEGER,
      status: Sequelize.INTEGER,
      address: Sequelize.STRING(500),
      area: Sequelize.DECIMAL(10,2),
      longitude: Sequelize.DOUBLE,
      latitude: Sequelize.DOUBLE,
      is_deleted: Sequelize.BOOLEAN,
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      created_by: Sequelize.UUID,
    });
    await queryInterface.addIndex('asset_logs', ['asset_id']);
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('asset_logs');
  },
};
