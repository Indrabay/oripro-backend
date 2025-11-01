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
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;

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
      dialectOptions: {},
    }
  );
} else {
  // PostgreSQL - Use connection string only
  const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.PGURI;

  if (!DATABASE_URL) {
    console.error('[Sequelize] ERROR: DATABASE_URL is required for PostgreSQL!');
    console.error('[Sequelize] Please set DATABASE_URL, POSTGRES_URL, or PGURI environment variable');
    console.error('[Sequelize] Format: postgresql://user:password@host:port/database?sslmode=require');
    console.error('[Sequelize] NOTE: If password contains special characters (@, /, etc.), they must be URL-encoded');
    console.error('[Sequelize] Example: @ becomes %40, / becomes %2F');
    throw new Error('DATABASE_URL is required for PostgreSQL');
  }

  // Parse and validate connection string
  let connectionUrl = DATABASE_URL || '';
  
  // Check if connection string needs password encoding
  // If password contains @ but URL doesn't start with properly encoded format, fix it
  try {
    // Try to parse the URL to detect if it's malformed
    const url = new URL(connectionUrl);
    const hostname = url.hostname;
    
    // If hostname looks wrong (very short, no dots, etc.), password might not be encoded
    if (hostname.length < 5 || (!hostname.includes('.') && !hostname.includes('localhost'))) {
      console.warn('[Sequelize] WARNING: Connection string hostname looks invalid:', hostname);
      console.warn('[Sequelize] This usually means password contains special characters that need URL encoding');
      console.warn('[Sequelize] Please URL-encode your password (e.g., @ -> %40, / -> %2F)');
    }
  } catch (e) {
    // URL parsing failed - might be malformed
    console.error('[Sequelize] ERROR: Connection string appears to be malformed');
    console.error('[Sequelize] Make sure passwords with special characters are URL-encoded');
    console.error('[Sequelize] Special characters that need encoding: @ %40, / %2F, : %3A, # %23, ? %3F, & %26');
    console.error(connectionUrl);
    console.error(e);
    throw new Error('Invalid DATABASE_URL format. Check password encoding.');
  }
  
  // Check if this is a Supabase connection
  const isSupabase = connectionUrl.includes('.supabase.co') || connectionUrl.includes('supabase');
  
  // For Supabase and cloud databases, we configure SSL via dialectOptions
  // Don't add sslmode to URL as it can conflict with dialectOptions
  // The dialectOptions will handle SSL configuration properly
  
  // Remove any existing sslmode from URL to avoid conflicts (we'll use dialectOptions instead)
  if (connectionUrl.includes('sslmode=')) {
    connectionUrl = connectionUrl.replace(/[?&]sslmode=[^&]*/, '');
    // Clean up any orphaned ? or & at the end
    connectionUrl = connectionUrl.replace(/\?$/, '').replace(/&$/, '');
    if (isVercel || process.env.NODE_ENV !== 'production') {
      console.log('[Sequelize] Removed sslmode from URL - using dialectOptions instead');
    }
  }

  // SSL configuration for dialect options (required for Supabase)
  // Supabase uses self-signed certificates, so we must set rejectUnauthorized to false
  // This allows the connection to proceed even though the cert chain can't be verified
  const postgresDialectOptions = {
    ssl: {
      require: true,              // Require SSL connection
      rejectUnauthorized: false  // Don't reject self-signed certificates (required for Supabase)
    }
  };
  
  if (isVercel || process.env.NODE_ENV !== 'production') {
    console.log('[Sequelize] SSL configured via dialectOptions:', {
      require: true,
      rejectUnauthorized: false,
      note: 'This allows self-signed certificates (required for Supabase)'
    });
  }

  // Log connection info (hide password, but show parsed hostname for debugging)
  if (isVercel || process.env.NODE_ENV !== 'production') {
    try {
      const url = new URL(connectionUrl);
      const safeUrl = connectionUrl.replace(/:[^:@]+@/, ':****@');
      console.log('[Sequelize] PostgreSQL connection:', {
        usingConnectionString: true,
        url: safeUrl,
        parsedHostname: url.hostname,
        parsedPort: url.port || '5432',
        parsedDatabase: url.pathname?.replace('/', '') || 'unknown',
        isSupabase,
        sslInUrl: connectionUrl.includes('ssl'),
        hasSSL: true,
      });
    } catch (e) {
      const safeUrl = connectionUrl.replace(/:[^:@]+@/, ':****@');
      console.log('[Sequelize] PostgreSQL connection:', {
        usingConnectionString: true,
        url: safeUrl,
        parseError: 'Could not parse URL for validation',
        isSupabase,
        sslInUrl: connectionUrl.includes('ssl'),
        hasSSL: true,
      });
    }
  }

  sequelize = new Sequelize(connectionUrl, {
    dialect: 'postgres',
    logging: false,
    pool: poolConfig,
    dialectOptions: postgresDialectOptions, // SSL always enabled
    dialectModule: require('pg'),
  });
}

module.exports = sequelize;
