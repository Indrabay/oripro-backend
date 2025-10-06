"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("unit_attachments", {
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

    await queryInterface.addIndex('unit_attachments', ['unit_id']);
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('unit_attachments');
  }
};
