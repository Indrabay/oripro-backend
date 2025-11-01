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
const dbUser = process.env.DB_USER || process.env.PGUSER || '';
const dbPassword = process.env.DB_PASSWORD || process.env.PGPASSWORD || '';
const dbName = process.env.DB_NAME || process.env.PGDATABASE || '';

// Validate required environment variables (especially critical in Vercel)
if (!dbHost) {
  console.error('[Sequelize] ERROR: Database host is not set!');
  console.error('[Sequelize] Checked DB_HOST, PGHOST:', {
    DB_HOST: process.env.DB_HOST,
    PGHOST: process.env.PGHOST,
    VERCEL: process.env.VERCEL,
    VERCEL_ENV: process.env.VERCEL_ENV,
  });
}

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
  // Validate we have all required values before creating Sequelize instance
  if (!dbHost || !dbUser || !dbName) {
    const missing = [];
    if (!dbHost) missing.push('host (DB_HOST or PGHOST)');
    if (!dbUser) missing.push('user (DB_USER or PGUSER)');
    if (!dbName) missing.push('database (DB_NAME or PGDATABASE)');
    
    console.error('[Sequelize] ERROR: Missing required database configuration:', missing.join(', '));
    console.error('[Sequelize] Environment check:', {
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      DB_HOST: process.env.DB_HOST ? 'set' : 'NOT SET',
      PGHOST: process.env.PGHOST ? 'set' : 'NOT SET',
      DB_USER: process.env.DB_USER ? 'set' : 'NOT SET',
      PGUSER: process.env.PGUSER ? 'set' : 'NOT SET',
      DB_NAME: process.env.DB_NAME ? 'set' : 'NOT SET',
      PGDATABASE: process.env.PGDATABASE ? 'set' : 'NOT SET',
    });
  }

  sequelize = new Sequelize(
    dbName,
    dbUser,
    dbPassword,
    {
      host: dbHost,
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
// Always log in Vercel to help debug connection issues
if (isVercel || process.env.NODE_ENV !== 'production') {
  console.log('[Sequelize] Database configuration:', {
    dialect: DB_TYPE,
    host: dbHost || '⚠️ NOT SET - This will cause ENOTFOUND errors!',
    port: process.env.PGPORT || 5432,
    database: dbName || '⚠️ NOT SET',
    user: dbUser || '⚠️ NOT SET',
    password: dbPassword ? '***set***' : '⚠️ NOT SET',
    ssl: shouldUseSSL,
    isVercel,
    isSupabase,
    hasAllRequiredVars: !!(dbHost && dbUser && dbName && dbPassword),
  });
  
  if (!dbHost || !dbUser || !dbName || !dbPassword) {
    console.error('[Sequelize] ⚠️  MISSING REQUIRED ENVIRONMENT VARIABLES!');
    console.error('[Sequelize] Please set these in Vercel:');
    if (!dbHost) console.error('[Sequelize]   - PGHOST or DB_HOST');
    if (!dbUser) console.error('[Sequelize]   - PGUSER or DB_USER');
    if (!dbName) console.error('[Sequelize]   - PGDATABASE or DB_NAME');
    if (!dbPassword) console.error('[Sequelize]   - PGPASSWORD or DB_PASSWORD');
  }
}

module.exports = sequelize;
