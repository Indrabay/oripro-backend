const sequelize = require('../src/models/sequelize');
const Role = require('../src/models/Role');

async function run(sequelize) {
  await sequelize.authenticate();
  await sequelize.sync();
  const roles = [
    { name: 'user', level: 1 },
    { name: 'admin', level: 50 },
    { name: 'super_admin', level: 100 }
  ];

  for (const role of roles) {
    await Role.upsert({ name: role.name, level: role.level });
    console.log(`Role '${role.name}' created/updated with level ${role.level}`);
  }

  console.log('All roles seeded successfully');
}

run(sequelize).catch((err) => {
  console.error(err);
  process.exit(1);
});
