'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create task_parents junction table
    await queryInterface.createTable('task_parents', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      child_task_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'tasks',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      parent_task_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'tasks',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // Add indexes
    await queryInterface.addIndex('task_parents', ['child_task_id']);
    await queryInterface.addIndex('task_parents', ['parent_task_id']);
    await queryInterface.addIndex('task_parents', ['child_task_id', 'parent_task_id'], {
      unique: true,
      name: 'task_parents_child_parent_unique'
    });

    // Migrate existing parent_task_id data to task_parents table
    // Only migrate rows where parent_task_id is not null
    await queryInterface.sequelize.query(`
      INSERT INTO task_parents (child_task_id, parent_task_id, created_at)
      SELECT id, parent_task_id, created_at
      FROM tasks
      WHERE parent_task_id IS NOT NULL
    `);

    // Note: We keep parent_task_id column for backward compatibility
    // It can be removed in a future migration if needed
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('task_parents');
  },
};

