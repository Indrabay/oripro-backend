'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if columns already exist before adding them
    const tableDescription = await queryInterface.describeTable('menus');
    
    // Add permission columns to menus table if they don't exist
    if (!tableDescription.can_view) {
      await queryInterface.addColumn('menus', 'can_view', {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      });
    }

    if (!tableDescription.can_create) {
      await queryInterface.addColumn('menus', 'can_create', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      });
    }

    if (!tableDescription.can_update) {
      await queryInterface.addColumn('menus', 'can_update', {
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

    // Create role_menu_permissions junction table if it doesn't exist
    const tables = await queryInterface.showAllTables();
    if (!tables.includes('role_menu_permissions')) {
      await queryInterface.createTable('role_menu_permissions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      role_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'roles',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      menu_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'menus',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      can_view: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      can_create: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      can_update: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      can_delete: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      can_confirm: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Add indexes for role_menu_permissions
    await queryInterface.addIndex('role_menu_permissions', ['role_id']);
    await queryInterface.addIndex('role_menu_permissions', ['menu_id']);
    await queryInterface.addIndex('role_menu_permissions', ['role_id', 'menu_id'], {
      unique: true,
      name: 'unique_role_menu_permission'
    });
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Drop role_menu_permissions table
    await queryInterface.dropTable('role_menu_permissions');

    // Remove permission columns from menus table
    await queryInterface.removeColumn('menus', 'can_view');
    await queryInterface.removeColumn('menus', 'can_create');
    await queryInterface.removeColumn('menus', 'can_update');
    await queryInterface.removeColumn('menus', 'can_delete');
    await queryInterface.removeColumn('menus', 'can_confirm');
  }
};
