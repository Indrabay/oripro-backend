const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgres://changeme:changeme@changeme:5432/changeme');

async function seedMenus() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

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

    // Check if menus already exist
    const existingMenus = await sequelize.query('SELECT COUNT(*) as count FROM menus', {
      type: Sequelize.QueryTypes.SELECT
    });

    if (existingMenus[0].count > 0) {
      console.log('Menus already exist, skipping seeding...');
      return;
    }

    // Insert menus
    for (const menu of menus) {
      await sequelize.query(
        `INSERT INTO menus (id, title, url, icon, parent_id, "order", is_active, created_at, updated_at) 
         VALUES (:id, :title, :url, :icon, :parent_id, :order, :is_active, :created_at, :updated_at)`,
        {
          replacements: menu,
          type: Sequelize.QueryTypes.INSERT
        }
      );
    }

    console.log('✅ Menus seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding menus:', error);
  } finally {
    await sequelize.close();
  }
}

seedMenus();
