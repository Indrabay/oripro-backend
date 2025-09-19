'use strict';

module.exports = {
  up: async (QueryInterface, Sequelize) => {
    await QueryInterface.createTable('tenant-unit', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      tenant_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      unit_id: {
        type: Sequelize.UUID,
        allowNull: false,
      }
    });
  },
  down: async (QueryInterface) => {
    await QueryInterface.dropTable('tenant-unit');
  }
};
