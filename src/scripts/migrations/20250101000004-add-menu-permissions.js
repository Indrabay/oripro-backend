'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if table exists first
    const tables = await queryInterface.showAllTables();
    if (!tables.includes('menus')) {
      console.log('Menus table does not exist, skipping permission columns addition');
      return;
    }
    
    // Check if columns already exist before adding them
    const tableDescription = await queryInterface.describeTable('menus');
    
    if (!tableDescription.can_view) {
      await queryInterface.addColumn('menus', 'can_view', {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      });
    }

    if (!tableDescription.can_add) {
      await queryInterface.addColumn('menus', 'can_add', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      });
    }

    if (!tableDescription.can_edit) {
      await queryInterface.addColumn('menus', 'can_edit', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      });
    }

    if (!tableDescription.can_delete) {
      await queryInterface.addColumn('menus', 'can_delete', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      });
    }

    if (!tableDescription.can_confirm) {
      await queryInterface.addColumn('menus', 'can_confirm', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('menus', 'can_view');
    await queryInterface.removeColumn('menus', 'can_add');
    await queryInterface.removeColumn('menus', 'can_edit');
    await queryInterface.removeColumn('menus', 'can_delete');
    await queryInterface.removeColumn('menus', 'can_confirm');
  }
};
