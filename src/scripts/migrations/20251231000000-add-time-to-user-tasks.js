'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('user_tasks', 'time', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Schedule time from task_schedules (HH:mm format)'
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('user_tasks', 'time');
  },
};

