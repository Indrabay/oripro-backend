'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const categories = [
      {
        name: 'Restoran',
      },
      {
        name: 'Sport Club',
      },
      {
        name: 'Kantor',
      },
      {
        name: 'Tempat Hiburan',
      },
      {
        name: 'Retail',
      },
      {
        name: 'Klinik',
      },
    ];

    await queryInterface.bulkInsert('tenant_categories', categories);
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete('tenant_categories', null, {});
  }
}