"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("unit-attachments", {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true
      },
      unit_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      url: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
    });

    await queryInterface.addIndex('unit-attachments', ['unit_id']);
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('unit-attachments');
  }
};
