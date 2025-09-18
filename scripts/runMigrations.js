const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config();

const DB_TYPE = (process.env.DB_TYPE || 'postgres').toLowerCase();
let sequelize;

if (DB_TYPE === 'mysql') {
  sequelize = new Sequelize(
    process.env.MYSQL_DATABASE,
    process.env.MYSQL_USER,
    process.env.MYSQL_PASSWORD,
    {
      host: process.env.MYSQL_HOST,
      dialect: 'mysql',
      logging: console.log,
    }
  );
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME || process.env.PGDATABASE,
    process.env.DB_USER || process.env.PGUSER,
    process.env.DB_PASSWORD || process.env.PGPASSWORD,
    {
      host: process.env.DB_HOST || process.env.PGHOST,
      port: process.env.DB_PORT || process.env.PGPORT || 5432,
      dialect: 'postgres',
      logging: console.log,
    }
  );
}

async function runMigrations() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Get all migration files
    const migrationsPath = path.join(__dirname, '../src/scripts/migrations');
    const migrationFiles = fs.readdirSync(migrationsPath)
      .filter(file => file.endsWith('.js'))
      .sort();

    console.log(`Found ${migrationFiles.length} migration files:`);
    migrationFiles.forEach(file => console.log(`  - ${file}`));

    // Check if SequelizeMeta table exists, create if not
    const [results] = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'SequelizeMeta'
      );
    `);

    if (!results[0].exists) {
      console.log('Creating SequelizeMeta table...');
      await sequelize.query(`
        CREATE TABLE "SequelizeMeta" (
          name VARCHAR(255) NOT NULL PRIMARY KEY
        );
      `);
    }

    // Get already executed migrations
    const [executedMigrations] = await sequelize.query(
      'SELECT name FROM "SequelizeMeta" ORDER BY name'
    );
    const executedNames = executedMigrations.map(row => row.name);

    console.log(`Already executed migrations: ${executedNames.length}`);
    executedNames.forEach(name => console.log(`  - ${name}`));

    // Run pending migrations
    let executedCount = 0;
    for (const file of migrationFiles) {
      if (!executedNames.includes(file)) {
        console.log(`\nRunning migration: ${file}`);
        
        const migration = require(path.join(migrationsPath, file));
        
        if (migration.up) {
          await migration.up(sequelize.getQueryInterface(), Sequelize);
          
          // Record migration as executed
          await sequelize.query(
            'INSERT INTO "SequelizeMeta" (name) VALUES (?)',
            { replacements: [file] }
          );
          
          executedCount++;
          console.log(`✓ Migration ${file} completed successfully`);
        } else {
          console.log(`⚠ Migration ${file} has no 'up' function`);
        }
      } else {
        console.log(`⏭ Skipping already executed migration: ${file}`);
      }
    }

    if (executedCount === 0) {
      console.log('\n✅ No new migrations to run. Database is up to date.');
    } else {
      console.log(`\n✅ Successfully executed ${executedCount} migration(s).`);
    }

    await sequelize.close();
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

module.exports = runMigrations;

runMigrations();


