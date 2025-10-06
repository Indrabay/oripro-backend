'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('tenant_logs', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true
      },
      tenant_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      contract_begin_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      contract_end_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      code: {
        type:Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      status: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      rent_duration: Sequelize.INTEGER,
      rent_duration_unit: Sequelize.INTEGER,
      created_by: Sequelize.UUID,
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('tenant_logs');
  },
}