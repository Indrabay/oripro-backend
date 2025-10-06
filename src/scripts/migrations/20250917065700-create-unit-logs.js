"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("unit_logs", {
      id: {type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true},
      unit_id: { type: Sequelize.UUID, allowNull: false },
      asset_id: Sequelize.UUID,
      name: Sequelize.STRING,
      size: Sequelize.FLOAT,
      rent_price: Sequelize.FLOAT,
      lamp: Sequelize.INTEGER,
      electric_socket: Sequelize.INTEGER,
      electrical_power: Sequelize.INTEGER,
      electrical_unit: Sequelize.STRING,
      is_toilet_exist: Sequelize.BOOLEAN,
      description: Sequelize.STRING,
      is_deleted: Sequelize.BOOLEAN,
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      created_by: Sequelize.UUID,
    });

    await queryInterface.addIndex('unit_logs', ['unit_id']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable("unit_logs");
  },
};
