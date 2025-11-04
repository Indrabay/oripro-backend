'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add is_main_task column
    await queryInterface.addColumn('user_tasks', 'is_main_task', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indicates if this is a main user task (true) or child user task (false)'
    });

    // Add parent_user_task_id column
    await queryInterface.addColumn('user_tasks', 'parent_user_task_id', {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'user_tasks',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      comment: 'Reference to parent user task if this is a child task'
    });

    // Add index for parent_user_task_id for better query performance
    await queryInterface.addIndex('user_tasks', ['parent_user_task_id']);
    
    // Add index for is_main_task
    await queryInterface.addIndex('user_tasks', ['is_main_task']);
  },

  down: async (queryInterface) => {
    // Remove indexes
    await queryInterface.removeIndex('user_tasks', ['is_main_task']);
    await queryInterface.removeIndex('user_tasks', ['parent_user_task_id']);
    
    // Remove columns
    await queryInterface.removeColumn('user_tasks', 'parent_user_task_id');
    await queryInterface.removeColumn('user_tasks', 'is_main_task');
  },
};

