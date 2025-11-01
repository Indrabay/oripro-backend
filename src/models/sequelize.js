const { Sequelize } = require('sequelize');

const DB_TYPE = (process.env.DB_TYPE || 'postgres').toLowerCase();
let sequelize;

// Connection pool configuration optimized for serverless environments
// Serverless functions have cold starts and may need connection reuse
const poolConfig = {
  max: 5, // Maximum number of connections in pool
  min: 0, // Minimum number of connections in pool
  acquire: 30000, // Maximum time (ms) to get connection before error
  idle: 10000, // Maximum time (ms) connection can be idle before release
};

// Additional configuration for serverless
const dialectOptions = process.env.VERCEL || process.env.VERCEL_ENV
  ? {
      // SSL is often required for managed databases on Vercel
      ssl: process.env.DB_SSL === 'true' || process.env.PGSSL === 'true' 
        ? { rejectUnauthorized: false }
        : false,
    }
  : {};

if (DB_TYPE === 'mysql') {
  sequelize = new Sequelize(
    process.env.MYSQL_DATABASE,
    process.env.MYSQL_USER,
    process.env.MYSQL_PASSWORD,
    {
      host: process.env.MYSQL_HOST,
      dialect: 'mysql',
      logging: false,
      pool: poolConfig,
      dialectOptions,
    }
  );
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME || process.env.PGDATABASE,
    process.env.DB_USER || process.env.PGUSER,
    process.env.DB_PASSWORD || process.env.PGPASSWORD,
    {
      host: process.env.DB_HOST || process.env.PGHOST,
      port: process.env.PGPORT || 5432,
      dialect: 'postgres',
      logging: false,
      pool: poolConfig,
      dialectOptions,
      dialectModule: require('pg'),
    }
  );
}

module.exports = sequelize;
