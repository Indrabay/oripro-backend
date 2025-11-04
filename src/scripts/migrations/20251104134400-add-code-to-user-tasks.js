'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('user_tasks', 'code', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addIndex('user_tasks', ['code']);
  },

  down: async (queryInterface) => {
    await queryInterface.removeIndex('user_tasks', ['code']);
    await queryInterface.removeColumn('user_tasks', 'code');
  },
};

