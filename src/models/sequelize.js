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

// Support connection string (preferred) or individual variables
const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.PGURI;

// Extract individual variables for fallback or if connection string not provided
const dbHost = process.env.DB_HOST || process.env.PGHOST || '';
const dbUser = process.env.DB_USER || process.env.PGUSER || '';
const dbPassword = process.env.DB_PASSWORD || process.env.PGPASSWORD || '';
const dbName = process.env.DB_NAME || process.env.PGDATABASE || '';

// Validate required environment variables (especially critical in Vercel)
// Check if we have either connection string OR individual variables
if (!DATABASE_URL && !dbHost) {
  console.error('[Sequelize] ERROR: Database configuration is not set!');
  console.error('[Sequelize] Please provide either:');
  console.error('[Sequelize]   - DATABASE_URL (preferred) or POSTGRES_URL or PGURI');
  console.error('[Sequelize]   OR individual variables: PGHOST/DB_HOST, PGUSER/DB_USER, etc.');
  console.error('[Sequelize] Checked:', {
    DATABASE_URL: process.env.DATABASE_URL ? 'set' : 'NOT SET',
    POSTGRES_URL: process.env.POSTGRES_URL ? 'set' : 'NOT SET',
    PGURI: process.env.PGURI ? 'set' : 'NOT SET',
    DB_HOST: process.env.DB_HOST ? 'set' : 'NOT SET',
    PGHOST: process.env.PGHOST ? 'set' : 'NOT SET',
    VERCEL: process.env.VERCEL,
    VERCEL_ENV: process.env.VERCEL_ENV,
  });
}

// Check if this is a Supabase connection (multiple checks for reliability)
// Check both connection string and individual hostname
const connectionStringHost = DATABASE_URL ? (DATABASE_URL.match(/@([^:/\s]+)/)?.[1] || '') : '';
const effectiveHost = dbHost || connectionStringHost;
const isSupabase = effectiveHost && (
  effectiveHost.includes('.supabase.co') || 
  effectiveHost.includes('supabase') ||
  DATABASE_URL?.includes('.supabase.co') ||
  DATABASE_URL?.includes('supabase') ||
  (isVercel && effectiveHost.match(/db\.[a-z0-9]+\.supabase/))
);

// Enable SSL if explicitly set, or if detected Supabase hostname
// Supabase ALWAYS requires SSL for external connections
// Priority: explicit setting > Supabase detection > Vercel + non-localhost
const shouldUseSSL = 
  process.env.DB_SSL === 'true' || 
  process.env.PGSSL === 'true' || 
  isSupabase || // Supabase ALWAYS requires SSL - this is mandatory
  (isVercel && dbHost && dbHost.length > 0 && !dbHost.includes('localhost') && !dbHost.includes('127.0.0.1'));

// FORCE SSL for Supabase connections - this is non-negotiable
// If Supabase is detected but SSL logic failed, override it
let finalShouldUseSSL = shouldUseSSL;
if (isSupabase && !finalShouldUseSSL) {
  console.warn('[Sequelize] ⚠️  WARNING: Supabase detected but SSL was not enabled! Forcing SSL...');
  finalShouldUseSSL = true;
}

// Set dialect options with SSL when needed
// Use finalShouldUseSSL to ensure Supabase always gets SSL
const dialectOptions = finalShouldUseSSL
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
  // Validate we have either connection string OR all required individual values
  if (!DATABASE_URL && (!dbHost || !dbUser || !dbName)) {
    const missing = [];
    if (!DATABASE_URL && !dbHost) missing.push('host (DB_HOST or PGHOST) or DATABASE_URL');
    if (!DATABASE_URL && !dbUser) missing.push('user (DB_USER or PGUSER) or DATABASE_URL');
    if (!DATABASE_URL && !dbName) missing.push('database (DB_NAME or PGDATABASE) or DATABASE_URL');
    
    console.error('[Sequelize] ERROR: Missing required database configuration:', missing.join(', '));
    console.error('[Sequelize] Environment check:', {
      DATABASE_URL: process.env.DATABASE_URL ? 'set' : 'NOT SET',
      POSTGRES_URL: process.env.POSTGRES_URL ? 'set' : 'NOT SET',
      PGURI: process.env.PGURI ? 'set' : 'NOT SET',
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

  // ALWAYS enable SSL for Supabase - configure it properly
  // For Supabase, SSL configuration must use rejectUnauthorized: false
  // This is the standard format for Supabase connections
  const postgresDialectOptions = {
    ssl: {
      rejectUnauthorized: false  // Required for Supabase - allows self-signed certs
    }
  };
  
  // Force SSL to be enabled - this is non-negotiable for Supabase
  // Even if detection failed, we enable it for Vercel + non-localhost connections
  const effectiveHostForSSL = dbHost || connectionStringHost;
  if (isVercel && effectiveHostForSSL && !effectiveHostForSSL.includes('localhost') && !effectiveHostForSSL.includes('127.0.0.1')) {
    console.log('[Sequelize] ✅ SSL FORCED ON - Vercel environment with remote database');
  }

  // Use connection string if provided (preferred method with SSL in URL)
  // Format: postgresql://user:password@host:port/database?sslmode=require
  if (DATABASE_URL) {
    // Parse and ensure SSL is in the connection string
    let connectionUrl = DATABASE_URL;
    
    // Ensure SSL mode is set in connection string
    if (!connectionUrl.includes('sslmode=') && !connectionUrl.includes('ssl=')) {
      // Add SSL mode to connection string
      const separator = connectionUrl.includes('?') ? '&' : '?';
      connectionUrl = `${connectionUrl}${separator}sslmode=require`;
      console.log('[Sequelize] Added sslmode=require to connection string');
    }
    
    // Log what we're using (hide password)
    const safeUrl = connectionUrl.replace(/:[^:@]+@/, ':****@');
    if (isVercel || process.env.NODE_ENV !== 'production') {
      console.log('[Sequelize] Using DATABASE_URL connection string:', safeUrl);
      console.log('[Sequelize] SSL in URL:', connectionUrl.includes('ssl'));
    }
    
    sequelize = new Sequelize(connectionUrl, {
      dialect: 'postgres',
      logging: false,
      pool: poolConfig,
      dialectOptions: postgresDialectOptions, // Ensure SSL options are also set here
      dialectModule: require('pg'),
    });
  } else {
    // Fallback to individual environment variables
    if (isVercel || process.env.NODE_ENV !== 'production') {
      console.log('[Sequelize] Using individual environment variables:', {
        host: dbHost,
        port: process.env.PGPORT || 5432,
        database: dbName,
        user: dbUser,
        dialectOptions: postgresDialectOptions,
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
        dialectOptions: postgresDialectOptions, // SSL ALWAYS enabled for Supabase/Vercel
        dialectModule: require('pg'),
      }
    );
  }

  // Verify the connection config after creation
  if (isVercel || process.env.NODE_ENV !== 'production') {
    try {
      // Access config safely - it may not be immediately available
      const config = sequelize.config || {};
      const dialectOpts = config.dialectOptions || {};
      console.log('[Sequelize] Connection instance created. Config:', {
        hasDialectOptions: !!dialectOpts,
        hasSSL: !!dialectOpts.ssl,
        sslRejectUnauthorized: dialectOpts.ssl?.rejectUnauthorized,
        host: config.host || 'unknown',
        database: config.database || 'unknown',
      });
    } catch (e) {
      console.error('[Sequelize] Error logging config:', e.message);
      console.log('[Sequelize] SSL is configured in postgresDialectOptions:', postgresDialectOptions);
    }
  }
}

// Log connection configuration (without sensitive data) for debugging
// Always log in Vercel to help debug connection issues
if (isVercel || process.env.NODE_ENV !== 'production') {
  // Log SSL configuration first
  console.log('[Sequelize] SSL Configuration:', {
    shouldUseSSL: finalShouldUseSSL,
    reason: isSupabase ? '✅ Supabase detected (MANDATORY)' : 
            process.env.DB_SSL === 'true' || process.env.PGSSL === 'true' ? '✅ Explicitly set' :
            isVercel && dbHost && !dbHost.includes('localhost') ? '✅ Vercel + non-localhost' :
            '❌ Not needed',
    isSupabase,
    isVercel,
    dbHost: dbHost ? `${dbHost.substring(0, 40)}` : 'empty',
  });
  
  if (isSupabase && !finalShouldUseSSL) {
    console.error('[Sequelize] ❌ CRITICAL ERROR: Supabase detected but SSL is disabled!');
    console.error('[Sequelize] This will cause connection failures. SSL should be enabled.');
  }
  
  // Log full database configuration
  console.log('[Sequelize] Database configuration:', {
    dialect: DB_TYPE,
    host: dbHost || '⚠️ NOT SET - This will cause ENOTFOUND errors!',
    port: process.env.PGPORT || 5432,
    database: dbName || '⚠️ NOT SET',
    user: dbUser || '⚠️ NOT SET',
    password: dbPassword ? '***set***' : '⚠️ NOT SET',
    ssl: finalShouldUseSSL ? '✅ ENABLED' : '❌ DISABLED',
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
