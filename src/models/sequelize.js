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

// Additional configuration for serverless and Supabase
// Supabase and most managed databases require SSL for external connections
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;
const dbHost = process.env.DB_HOST || process.env.PGHOST || '';
const isSupabase = dbHost.includes('.supabase.co');

// Enable SSL if explicitly set, or if detected Supabase hostname
// Supabase ALWAYS requires SSL for external connections
const shouldUseSSL = process.env.DB_SSL === 'true' || 
                     process.env.PGSSL === 'true' || 
                     isSupabase ||
                     (isVercel && dbHost && !dbHost.includes('localhost') && !dbHost.includes('127.0.0.1'));

// Set dialect options with SSL when needed
const dialectOptions = shouldUseSSL
  ? {
      // SSL configuration for managed databases (Supabase, AWS RDS, etc.)
      ssl: { rejectUnauthorized: false } // Required for Supabase and most cloud databases
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

// Log connection configuration (without sensitive data) for debugging
if (process.env.NODE_ENV !== 'production' || isVercel) {
  console.log('[Sequelize] Database config:', {
    dialect: DB_TYPE,
    host: process.env.DB_HOST || process.env.PGHOST || 'not set',
    port: process.env.PGPORT || 5432,
    ssl: shouldUseSSL,
    isVercel,
    isSupabase,
  });
}

module.exports = sequelize;
