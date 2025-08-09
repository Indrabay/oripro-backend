const bcrypt = require('bcryptjs');
const { getPgPool, getMysqlPool } = require('../src/config/db');

async function run() {
  const dbType = (process.env.DB_TYPE || 'postgres').toLowerCase();
  const email = 'test@example.com';
  const name = 'Test User';
  const password = 'password123';
  const passwordHash = await bcrypt.hash(password, 10);

  let roleId;
  if (dbType === 'mysql') {
    const pool = await getMysqlPool();
    // Ensure roles table has an id for 'user'
    await pool.query(
      `INSERT INTO roles (id, name)
       VALUES (UUID(), ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name)`,
      ['user']
    );
    const [rows] = await pool.query('SELECT id FROM roles WHERE name = ?', ['user']);
    roleId = rows[0].id;
    const passwordHash = await bcrypt.hash(password, 10);
    await pool.query(
      `INSERT INTO users (id, email, password, name, role_id, created_at, updated_at)
       VALUES (UUID(), ?, ?, ?, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE name = VALUES(name)`,
      [email, passwordHash, name, roleId]
    );
    await pool.end();
  } else {
    const pool = getPgPool();
    const { rows: roleRows } = await pool.query(
      `INSERT INTO roles (name)
       VALUES ($1)
       ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      ['user']
    );
    roleId = roleRows[0].id;
    await pool.query(
      `INSERT INTO users (email, password, name, role_id)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [email, passwordHash, name, roleId]
    );
    await pool.end();
  }

  console.log('Seeded user:', email);
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});


