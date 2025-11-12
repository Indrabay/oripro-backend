'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add category_id column to tenants table
    await queryInterface.addColumn('tenants', 'category_id', {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'tenant_categories',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    // Add index for better query performance
    await queryInterface.addIndex('tenants', ['category_id']);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove index
    await queryInterface.removeIndex('tenants', ['category_id']);
    // Remove category_id column
    await queryInterface.removeColumn('tenants', 'category_id');
  },
};

