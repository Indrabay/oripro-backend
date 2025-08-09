const { Pool } = require('pg');
// dotenv is preloaded via -r dotenv/config in npm scripts; fallback here for direct node execution
try {
  // eslint-disable-next-line global-require
  require('dotenv').config();
} catch (_) {
  // ignore
}

let pool;

function getPgPool() {
  if (!pool) {
    const {
      PGHOST,
      PGPORT,
      PGDATABASE,
      PGUSER,
      PGPASSWORD,
      PGSSL
    } = process.env;

    pool = new Pool({
      host: PGHOST || 'localhost',
      port: PGPORT ? Number(PGPORT) : 5432,
      database: PGDATABASE || 'oripro',
      user: PGUSER || 'postgres',
      password: typeof PGPASSWORD === 'string' ? PGPASSWORD : undefined,
      ssl: PGSSL ? { rejectUnauthorized: PGSSL !== 'allow' } : undefined,
      max: 10
    });
  }
  return pool;
}

module.exports = { getPgPool };
