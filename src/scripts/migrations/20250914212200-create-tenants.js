'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('tenants', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUID4,
        primaryKey: true
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
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('tenants');
  },
}