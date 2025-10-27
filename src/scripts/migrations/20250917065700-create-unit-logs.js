"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("unit_logs", {
      id: {
        type: Sequelize.BIGINT, 
        primaryKey: true, 
        autoIncrement: true
      },
      unit_id: { 
        type: Sequelize.UUID, 
        allowNull: false 
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
        defaultValue: Sequelize.NOW 
      },
    });

    await queryInterface.addIndex('unit_logs', ['unit_id']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable("unit_logs");
  },
};
