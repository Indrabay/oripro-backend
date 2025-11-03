'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if status column already exists before adding it
    const tableDescription = await queryInterface.describeTable('user_tasks');
    
    if (!tableDescription.status) {
      await queryInterface.addColumn('user_tasks', 'status', {
        type: Sequelize.INTEGER,
        defaultValue: 0, // pending
        allowNull: false,
        comment: 'Status: 0=pending, 1=inprogress, 2=completed'
      });
      
      // Update existing records based on start_at and completed_at
      await queryInterface.sequelize.query(`
        UPDATE user_tasks 
        SET status = CASE
          WHEN completed_at IS NOT NULL THEN 2
          WHEN start_at IS NOT NULL THEN 1
          ELSE 0
        END
      `);
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove status column from user_tasks table
    await queryInterface.removeColumn('user_tasks', 'status');
  },
};

