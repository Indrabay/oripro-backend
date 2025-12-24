'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Insert default settings for radius distance
    const settings = [
      {
        key: 'attendance_radius_distance',
        value: '20000',
        description: 'Radius distance untuk attendance dalam meter (default: 20000 meter)',
        created_by: null,
        updated_by: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        key: 'task_radius_distance',
        value: '20000',
        description: 'Radius distance untuk task completion dalam meter (default: 20000 meter)',
        created_by: null,
        updated_by: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    await queryInterface.bulkInsert('settings', settings, {
      ignoreDuplicates: true, // Skip if already exists
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('settings', {
      key: {
        [Sequelize.Op.in]: ['attendance_radius_distance', 'task_radius_distance']
      }
    }, {});
  }
};

