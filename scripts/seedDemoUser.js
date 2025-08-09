const bcrypt = require('bcryptjs');
const { getPgPool } = require('../src/config/db');

async function run() {
  const pool = getPgPool();
  const email = 'test@example.com';
  const name = 'Test User';
  const password = 'password123';
  const passwordHash = await bcrypt.hash(password, 10);

  // ensure a default role exists
  const { rows: roleRows } = await pool.query(
    `INSERT INTO roles (name)
     VALUES ($1)
     ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    ['user']
  );
  const roleId = roleRows[0].id;

  await pool.query(
    `INSERT INTO users (email, password, name, role_id)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    [email, passwordHash, name, roleId]
  );
  console.log('Seeded user:', email);
  await pool.end();
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});


