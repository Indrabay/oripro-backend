'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if task_group_id column already exists
    const tableDescription = await queryInterface.describeTable('tasks');
    
    if (!tableDescription.task_group_id) {
      await queryInterface.addColumn('tasks', 'task_group_id', {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'task_groups',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
      
      await queryInterface.addIndex('tasks', ['task_group_id']);
    }
  },
  down: async (queryInterface) => {
    await queryInterface.removeIndex('tasks', ['task_group_id']);
    await queryInterface.removeColumn('tasks', 'task_group_id');
  },
};

