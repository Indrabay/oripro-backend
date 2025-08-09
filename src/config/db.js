const { Pool } = require('pg');
const mysql = require('mysql2/promise');
// dotenv is preloaded via -r dotenv/config in npm scripts; fallback here for direct node execution
try {
  // eslint-disable-next-line global-require
  require('dotenv').config();
} catch (_) {
  // ignore
}

let pool;
let mysqlPool;

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

async function getMysqlPool() {
  if (!mysqlPool) {
    const {
      MYSQL_HOST,
      MYSQL_PORT,
      MYSQL_DATABASE,
      MYSQL_USER,
      MYSQL_PASSWORD
    } = process.env;

    mysqlPool = mysql.createPool({
      host: MYSQL_HOST || 'localhost',
      port: MYSQL_PORT ? Number(MYSQL_PORT) : 3306,
      database: MYSQL_DATABASE || 'oripro',
      user: MYSQL_USER || 'root',
      password: typeof MYSQL_PASSWORD === 'string' ? MYSQL_PASSWORD : undefined,
      waitForConnections: true,
      connectionLimit: 10,
      namedPlaceholders: true
    });
  }
  return mysqlPool;
}

module.exports = { getPgPool, getMysqlPool };
