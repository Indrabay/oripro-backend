const { getPgPool, getMysqlPool } = require('../src/config/db');

async function run() {
  const dbType = (process.env.DB_TYPE || 'postgres').toLowerCase();
  const roles = ['user', 'admin', 'super_admin'];

  if (dbType === 'mysql') {
    const pool = await getMysqlPool();
    for (const roleName of roles) {
      await pool.query(
        `INSERT INTO roles (id, name)
         VALUES (UUID(), ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name)`,
        [roleName]
      );
      console.log(`Role '${roleName}' created/updated`);
    }
    await pool.end();
  } else {
    const pool = getPgPool();
    for (const roleName of roles) {
      await pool.query(
        `INSERT INTO roles (name)
         VALUES ($1)
         ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name`,
        [roleName]
      );
      console.log(`Role '${roleName}' created/updated`);
    }
    await pool.end();
  }

  console.log('All roles seeded successfully');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
