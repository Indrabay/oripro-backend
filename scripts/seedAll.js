const { execSync } = require('child_process');
const path = require('path');

async function run() {
  console.log('🌱 Starting database seeding...\n');
  
  try {
    // Seed roles first
    console.log('1. Seeding roles...');
    execSync('npm run seed:roles', { stdio: 'inherit' });
    console.log('✅ Roles seeded successfully\n');
    
    // Seed demo user
    console.log('2. Seeding demo user...');
    execSync('npm run seed', { stdio: 'inherit' });
    console.log('✅ Demo user seeded successfully\n');
    
    // Seed admin users
    console.log('3. Seeding admin users...');
    execSync('npm run seed:admin', { stdio: 'inherit' });
    console.log('✅ Admin users seeded successfully\n');

    // Seed menus
    console.log('4. Seeding menus...');
    execSync('npm run seed:menus', { stdio: 'inherit' });
    console.log('✅ Menus seeded successfully\n');
    
    console.log('🎉 All seeding completed successfully!');
    console.log('\n📋 Available users:');
    console.log('• Demo User: test@example.com / password123 (role: user)');
    console.log('• Admin: admin@example.com / admin123 (role: admin)');
    console.log('• Super Admin: superadmin@example.com / superadmin123 (role: super_admin)');
    console.log('\n🔑 To access /api/users, use admin or super admin credentials');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

run();
