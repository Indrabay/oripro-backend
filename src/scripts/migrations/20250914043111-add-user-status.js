'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if table exists first
    const tables = await queryInterface.showAllTables();
    if (!tables.includes('users')) {
      console.log('Users table does not exist, skipping status column addition');
      return;
    }
    
    // Check if status column already exists before adding it
    const tableDescription = await queryInterface.describeTable('users');
    
    if (!tableDescription.status) {
      await queryInterface.addColumn('users', 'status', {
        type: Sequelize.ENUM('active', 'inactive', 'pending', 'suspended'),
        defaultValue: 'active',
        allowNull: false,
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove status column from users table
    await queryInterface.removeColumn('users', 'status');
  }
};
