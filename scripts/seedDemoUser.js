const bcrypt = require('bcryptjs');
const sequelize = require('../src/models/sequelize');
const User = require('../src/models/User');
const Role = require('../src/models/Role');

async function run(bcrypt, sequelize) {
  await sequelize.authenticate();
  await sequelize.sync();
  const email = 'test@example.com';
  const name = 'Test User';
  const password = 'password123';
  const passwordHash = await bcrypt.hash(password, 10);
  // Ensure role exists
  const [role] = await Role.upsert({ name: 'user' });
  const roleId = role.id;
  await User.upsert({
    email,
    password: passwordHash,
    name,
    role_id: roleId
  });
  console.log('Seeded user:', email);
}

run(bcrypt, sequelize).catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});


