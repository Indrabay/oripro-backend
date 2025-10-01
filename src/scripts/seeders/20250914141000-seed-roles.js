// Seeder for roles
'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('roles', [
      {
        id: 1,
        name: 'super_admin',
        level: 100,
      },
      {
        id: 2,
        name: 'admin',
        level: 50,
      },
      {
        id: 3,
        name: 'user',
        level: 1,
      },
    ]);
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete('roles', null, {});
  },
};
