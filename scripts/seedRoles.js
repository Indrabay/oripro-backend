const sequelize = require('../src/models/sequelize');
const Role = require('../src/models/Role');

async function run(sequelize) {
  await sequelize.authenticate();
  await sequelize.sync();
  const roles = ['user', 'admin', 'super_admin'];

  for (const roleName of roles) {
    await Role.upsert({ name: roleName });
    console.log(`Role '${roleName}' created/updated`);
  }

  console.log('All roles seeded successfully');
}

run(sequelize).catch((err) => {
  console.error(err);
  process.exit(1);
});
