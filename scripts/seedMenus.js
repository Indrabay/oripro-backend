const sequelize = require('../src/models/sequelize');
const Menu = require('../src/models/Menu');

async function run(sequelize) {
  await sequelize.authenticate();
  await sequelize.sync();
  
  const menus = [
    {
      id: 1,
      title: 'Dashboard',
      url: '/dashboard',
      icon: 'House',
      parent_id: null,
      order: 1,
      is_active: true,
    },
    {
      id: 2,
      title: 'Users',
      url: '#',
      icon: 'UsersRound',
      parent_id: null,
      order: 2,
      is_active: true,
    },
    {
      id: 3,
      title: 'Manage Users',
      url: '/users',
      icon: 'UsersRound',
      parent_id: 2,
      order: 1,
      is_active: true,
    },
    {
      id: 4,
      title: 'Manage Roles',
      url: '/roles',
      icon: 'ShieldCheck',
      parent_id: 2,
      order: 2,
      is_active: true,
    },
    {
      id: 5,
      title: 'Asset',
      url: '/asset',
      icon: 'Boxes',
      parent_id: null,
      order: 3,
      is_active: true,
    },
    {
      id: 6,
      title: 'Unit',
      url: '/unit',
      icon: 'Building2',
      parent_id: null,
      order: 4,
      is_active: true,
    },
    {
      id: 7,
      title: 'Tenants',
      url: '/tenants',
      icon: 'Building2',
      parent_id: null,
      order: 5,
      is_active: true,
    },
    {
      id: 8,
      title: 'Worker',
      url: '/worker',
      icon: 'Building2',
      parent_id: null,
      order: 5,
      is_active: true,
    },
    {
      id: 9,
      title: 'Settings',
      url: '#',
      icon: 'Settings',
      parent_id: null,
      order: 6,
      is_active: true,
    },
    {
      id: 10,
      title: 'Menu Management',
      url: '/menus',
      icon: 'Menu',
      parent_id: 9,
      order: 1,
      is_active: true,
    },
    {
      id: 11,
      title: 'Company',
      url: '/company',
      icon: 'Building2',
      parent_id: 9,
      order: 2,
      is_active: true,
    },
    {
      id: 12,
      title: 'Notification',
      url: '/notification',
      icon: 'Bell',
      parent_id: 9,
      order: 3,
      is_active: true,
    },
  ];

  for (const menu of menus) {
    await Menu.upsert(menu);
    console.log(`Menu '${menu.title}' created/updated with ID ${menu.id}`);
  }

  console.log('All menus seeded successfully');
}

run(sequelize).catch((err) => {
  console.error(err);
  process.exit(1);
});
