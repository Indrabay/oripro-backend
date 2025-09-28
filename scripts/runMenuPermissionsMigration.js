const { Sequelize } = require('sequelize');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Database configuration
const config = require('../config/config.json')[process.env.NODE_ENV || 'postgres'];

const sequelize = new Sequelize(config.database, config.username, config.password, config);

async function runMigration() {
  try {
    console.log('Starting menu permissions migration...');
    
    // Import the migration
    const migration = require('../src/scripts/migrations/20250101000000-add-menu-permissions');
    
    // Run the migration
    await migration.up(sequelize.getQueryInterface(), Sequelize);
    
    console.log('Menu permissions migration completed successfully!');
    
    // Close the connection
    await sequelize.close();
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
runMigration();
