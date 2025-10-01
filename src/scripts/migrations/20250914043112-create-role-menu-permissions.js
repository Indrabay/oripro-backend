'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('role_menu_permissions', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      role_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'roles',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      menu_id: {
        type: Sequelize.INTEGER,
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
        defaultValue: Sequelize.NOW,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false,
      },
    });

    // Add indexes
    try {
      await queryInterface.addIndex('role_menu_permissions', ['role_id']);
    } catch (error) {
      if (!error.message.includes('already exists')) {
        throw error;
      }
    }
    
    try {
      await queryInterface.addIndex('role_menu_permissions', ['menu_id']);
    } catch (error) {
      if (!error.message.includes('already exists')) {
        throw error;
      }
    }
    
    try {
      await queryInterface.addIndex('role_menu_permissions', ['role_id', 'menu_id'], {
        unique: true,
        name: 'unique_role_menu_permission',
      });
    } catch (error) {
      if (!error.message.includes('already exists')) {
        throw error;
      }
    }
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('role_menu_permissions');
  },
};
