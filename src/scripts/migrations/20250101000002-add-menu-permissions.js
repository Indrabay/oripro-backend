'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('menus', 'can_view', {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    });

    await queryInterface.addColumn('menus', 'can_add', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });

    await queryInterface.addColumn('menus', 'can_edit', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });

    await queryInterface.addColumn('menus', 'can_delete', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });

    await queryInterface.addColumn('menus', 'can_confirm', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('menus', 'can_view');
    await queryInterface.removeColumn('menus', 'can_add');
    await queryInterface.removeColumn('menus', 'can_edit');
    await queryInterface.removeColumn('menus', 'can_delete');
    await queryInterface.removeColumn('menus', 'can_confirm');
  }
};
