// Seeder for users
'use strict';
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const roles = await queryInterface.sequelize.query(
      'SELECT id, name FROM roles',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const getRoleId = (roleName) => {
      const role = roles.find(r => r.name === roleName);
      return role ? role.id : null;
    };

    const users = [
      {
        id: uuidv4(),
        email: 'superadmin@example.com',
        password: await bcrypt.hash('superadmin', 10),
        name: 'Super Admin',
        gender: 1,
        phone: '08181818181',
        role_id: getRoleId('super_admin'),
      },
      {
        id: uuidv4(),
        email: 'admin@example.com',
        password: await bcrypt.hash('adminuser', 10),
        name: 'Admin User',
        gender: 2,
        phone: '08282828282',
        role_id: getRoleId('admin'),
      },
      {
        id: uuidv4(),
        email: 'user@example.com',
        password: await bcrypt.hash('normaluser', 10),
        name: 'Normal User',
        gender: 1,
        phone: '08383838383',
        role_id: getRoleId('user'),
      },
    ];

    await queryInterface.bulkInsert('users', users);
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete('users', null, {});
  },
};
