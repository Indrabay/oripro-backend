const { getPgPool, getMysqlPool } = require('../src/config/db');

async function run() {
  const dbType = (process.env.DB_TYPE || 'postgres').toLowerCase();
  if (dbType === 'mysql') {
    const pool = await getMysqlPool();
    const mysqlStatements = [
      `CREATE TABLE IF NOT EXISTS roles (
        id CHAR(36) PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        level INT NOT NULL DEFAULT 0
      )`,
      `CREATE TABLE IF NOT EXISTS users (
        id CHAR(36) PRIMARY KEY,
        email VARCHAR(320) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name VARCHAR(255),
        role_id CHAR(36),
        created_by CHAR(36),
        updated_by CHAR(36),
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_role_id FOREIGN KEY (role_id) REFERENCES roles(id)
      )`,
      `CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id CHAR(36) PRIMARY KEY,
        user_id CHAR(36) NOT NULL,
        token_hash VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used_at TIMESTAMP NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_prt_user_id (user_id),
        INDEX idx_prt_token_hash (token_hash),
        CONSTRAINT fk_prt_user_id FOREIGN KEY (user_id) REFERENCES users(id)
      )`,
      `INSERT INTO roles (id, name, level)
        VALUES (UUID(), 'super_admin', 100)
        ON DUPLICATE KEY UPDATE level = VALUES(level)`,
      `INSERT INTO roles (id, name, level)
        VALUES (UUID(), 'admin', 50)
        ON DUPLICATE KEY UPDATE level = VALUES(level)`,
      `CREATE TABLE IF NOT EXISTS assets (
        id CHAR(36) PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        code VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        asset_type INT NOT NULL,
        status INT NOT NULL DEFAULT 1,
        address VARCHAR(500),
        area DECIMAL(10,2),
        longitude DECIMAL(10,7),
        latitude DECIMAL(10,7),
        created_by CHAR(36),
        updated_by CHAR(36),
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      `CREATE INDEX idx_assets_code ON assets (code)`,
      `CREATE INDEX idx_assets_asset_type ON assets (asset_type)`,
      `CREATE TABLE IF NOT EXISTS asset_admins (
        asset_id CHAR(36) NOT NULL,
        user_id CHAR(36) NOT NULL,
        PRIMARY KEY (asset_id, user_id),
        INDEX idx_asset_admins_user (user_id)
      )`
    ];
    for (const stmt of mysqlStatements) {
      try {
        await pool.query(stmt);
      } catch (err) {
        // Ignore index already exists errors
        if (err.code === 'ER_DUP_KEYNAME' || err.code === 'ER_TABLE_EXISTS_ERROR') continue;
        throw err;
      }
    }
    console.log('MySQL migrations applied');
    await pool.end();
  } else {
    const pool = getPgPool();
    await pool.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      -- roles table
      CREATE TABLE IF NOT EXISTS roles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT UNIQUE NOT NULL,
        level INT NOT NULL DEFAULT 0
      );
      ALTER TABLE roles ADD COLUMN IF NOT EXISTS level INT NOT NULL DEFAULT 0;
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT,
        role_id UUID REFERENCES roles(id),
        created_by UUID,
        updated_by UUID,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id),
        token_hash TEXT NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        used_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      -- default roles
      INSERT INTO roles (name, level) VALUES ('super_admin', 100)
        ON CONFLICT (name) DO UPDATE SET level = EXCLUDED.level;
      INSERT INTO roles (name, level) VALUES ('admin', 50)
        ON CONFLICT (name) DO UPDATE SET level = EXCLUDED.level;
      -- assets
      CREATE TABLE IF NOT EXISTS assets (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        description TEXT,
        code  VARCHAR(100) NOT NULL,
        asset_type int NOT NULL,
        status int NOT NULL DEFAULT 1,
        address VARCHAR(500),
        area DECIMAL(10,2) NULL,
        longitude DOUBLE PRECISION NULL,
        latitude DOUBLE PRECISION NULL,
        created_by UUID NULL,
        updated_by UUID NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_assets_code ON assets (code);
      CREATE INDEX IF NOT EXISTS idx_assets_asset_type ON assets (asset_type);
      ALTER TABLE assets
        ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION NULL,
        ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION NULL,
        ADD COLUMN IF NOT EXISTS created_by UUID NULL,
        ADD COLUMN IF NOT EXISTS updated_by UUID NULL;
      CREATE TABLE IF NOT EXISTS asset_admins (
        asset_id UUID NOT NULL,
        user_id UUID NOT NULL,
        PRIMARY KEY (asset_id, user_id)
      );
      CREATE OR REPLACE FUNCTION set_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
      DROP TRIGGER IF EXISTS users_set_updated_at ON users;
      CREATE TRIGGER users_set_updated_at BEFORE UPDATE ON users
      FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
    `);
    console.log('PostgreSQL migrations applied');
    await pool.end();
  }
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});


