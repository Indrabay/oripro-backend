const bcrypt = require('bcryptjs');
const sequelize = require('../src/models/sequelize');
const User = require('../src/models/User');
const Role = require('../src/models/Role');

async function run(bcrypt, sequelize) {
  await sequelize.authenticate();
  await sequelize.sync();

  const users = [
    {
      email: 'admin@example.com',
      name: 'Admin User',
      password: 'admin123',
      roleName: 'admin'
    },
    {
      email: 'superadmin@example.com',
      name: 'Super Admin User',
      password: 'superadmin123',
      roleName: 'super_admin'
    }
  ];

  for (const userData of users) {
    // Get role ID
    const role = await Role.findOne({ where: { name: userData.roleName } });
    if (!role) {
      console.error(`Role '${userData.roleName}' not found`);
      continue;
    }
    const roleId = role.id;

    // Hash password
    const passwordHash = await bcrypt.hash(userData.password, 10);

    // Upsert user
    await User.upsert({
      email: userData.email,
      password: passwordHash,
      name: userData.name,
      role_id: roleId
    });
    console.log(`User '${userData.email}' (${userData.roleName}) created/updated`);
  }

  console.log('Admin users seeded successfully');
  console.log('\nLogin credentials:');
  console.log('Admin: admin@example.com / admin123');
  console.log('Super Admin: superadmin@example.com / superadmin123');
}

run(bcrypt, sequelize).catch((err) => {
  console.error(err);
  process.exit(1);
});
