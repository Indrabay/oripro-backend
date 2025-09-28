'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const menus = [
      {
        id: '11111111-1111-1111-1111-111111111111',
        title: 'Dashboard',
        url: '/dashboard',
        icon: 'House',
        parent_id: null,
        order: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        title: 'Users',
        url: '#',
        icon: 'UsersRound',
        parent_id: null,
        order: 2,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        title: 'Manage Users',
        url: '/users',
        icon: 'UsersRound',
        parent_id: '22222222-2222-2222-2222-222222222222',
        order: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: '44444444-4444-4444-4444-444444444444',
        title: 'Manage Roles',
        url: '/roles',
        icon: 'ShieldCheck',
        parent_id: '22222222-2222-2222-2222-222222222222',
        order: 2,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: '55555555-5555-5555-5555-555555555555',
        title: 'Asset',
        url: '/asset',
        icon: 'Boxes',
        parent_id: null,
        order: 3,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: '66666666-6666-6666-6666-666666666666',
        title: 'Unit',
        url: '/unit',
        icon: 'Building2',
        parent_id: null,
        order: 4,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: '77777777-7777-7777-7777-777777777777',
        title: 'Tenants',
        url: '/tenants',
        icon: 'Building2',
        parent_id: null,
        order: 5,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: '88888888-8888-8888-8888-888888888888',
        title: 'Menu Management',
        url: '/menus',
        icon: 'Menu',
        parent_id: null,
        order: 6,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    await queryInterface.bulkInsert('menus', menus, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('menus', null, {});
  }
};
