'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Ensure all parent_task_id data has been migrated to task_parents table
    // This was done in the create-task-parents migration, but we'll verify again
    await queryInterface.sequelize.query(`
      INSERT INTO task_parents (child_task_id, parent_task_id, created_at)
      SELECT id, parent_task_id, created_at
      FROM tasks
      WHERE parent_task_id IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM task_parents tp
          WHERE tp.child_task_id = tasks.id
            AND tp.parent_task_id = tasks.parent_task_id
        )
    `);

    // Remove the parent_task_id column from tasks table
    await queryInterface.removeColumn('tasks', 'parent_task_id');
  },

  down: async (queryInterface, Sequelize) => {
    // Add back the parent_task_id column
    await queryInterface.addColumn('tasks', 'parent_task_id', {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'tasks',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Migrate data back from task_parents table (only first parent for each task)
    // Note: This loses data if a task has multiple parents
    await queryInterface.sequelize.query(`
      UPDATE tasks t
      SET parent_task_id = (
        SELECT tp.parent_task_id
        FROM task_parents tp
        WHERE tp.child_task_id = t.id
        LIMIT 1
      )
      WHERE EXISTS (
        SELECT 1 FROM task_parents tp
        WHERE tp.child_task_id = t.id
      )
    `);
  },
};

