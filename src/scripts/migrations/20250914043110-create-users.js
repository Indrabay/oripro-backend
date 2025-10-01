// Migration for User model
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      email: {
        type: Sequelize.STRING(320),
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      name: Sequelize.STRING,
      role_id: {
        type: Sequelize.INTEGER,
        references: { model: 'roles', key: 'id' },
      },
      created_by: Sequelize.UUID,
      updated_by: Sequelize.UUID,
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('users');
  },
};
