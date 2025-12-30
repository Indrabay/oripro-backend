// Seeder for role_menu_permissions - Super Admin
'use strict';

module.exports = {
  up: async (queryInterface) => {
    // Super Admin (role_id: 1) dengan akses penuh ke semua menu
    const permissions = [
      // Dashboard
      {
        role_id: 1,
        menu_id: 1, // Dashboard
        can_view: true,
        can_create: true,
        can_update: true,
        can_delete: true,
        can_confirm: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      // Users (Parent Menu)
      {
        role_id: 1,
        menu_id: 2, // Users
        can_view: true,
        can_create: true,
        can_update: true,
        can_delete: true,
        can_confirm: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      // Manage Roles
      {
        role_id: 1,
        menu_id: 4, // Manage Roles
        can_view: true,
        can_create: true,
        can_update: true,
        can_delete: true,
        can_confirm: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      // Asset
      {
        role_id: 1,
        menu_id: 5, // Asset
        can_view: true,
        can_create: true,
        can_update: true,
        can_delete: true,
        can_confirm: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      // Unit
      {
        role_id: 1,
        menu_id: 6, // Unit
        can_view: true,
        can_create: true,
        can_update: true,
        can_delete: true,
        can_confirm: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      // Tenants
      {
        role_id: 1,
        menu_id: 7, // Tenants
        can_view: true,
        can_create: true,
        can_update: true,
        can_delete: true,
        can_confirm: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    await queryInterface.bulkInsert('role_menu_permissions', permissions, {});
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('role_menu_permissions', {
      role_id: 1,
    }, {});
  },
};

