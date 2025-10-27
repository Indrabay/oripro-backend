'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('scan_infos', 'asset_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'assets',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
    
    await queryInterface.addIndex('scan_infos', ['asset_id']);
  },
  down: async (queryInterface) => {
    await queryInterface.removeIndex('scan_infos', ['asset_id']);
    await queryInterface.removeColumn('scan_infos', 'asset_id');
  },
};
