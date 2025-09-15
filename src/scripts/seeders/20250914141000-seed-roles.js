// Seeder for roles
'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('roles', [
      {
        id: uuidv4(),
        name: 'super_admin',
        level: 100,
      },
      {
        id: uuidv4(),
        name: 'admin',
        level: 50,
      },
      {
        id: uuidv4(),
        name: 'user',
        level: 1,
      },
    ]);
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete('roles', null, {});
  },
};
