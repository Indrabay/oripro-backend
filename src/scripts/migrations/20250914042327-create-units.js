'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('units', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
        },
        asset_id: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        size: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },
        rent_price: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },
        lamp: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
        },
        electric_socket: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
        },
        electrical_power: Sequelize.INTEGER,
        electrical_unit: {
          type: Sequelize.STRING,
          defaultValue: "Watt"
        },
        is_toilet_exist: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        description: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        is_deleted: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        created_at: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW,
        },
        updated_at: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW,
        },
        created_by: {
          type: Sequelize.UUID,
          allowNull: true,
        },
        updated_by: {
          type: Sequelize.UUID,
          allowNull: true,
        }
      });
      await queryInterface.addIndex('units', ['asset_id'], {
        transaction
      });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface) {
    await queryInterface.dropTable('units');
  }
};
