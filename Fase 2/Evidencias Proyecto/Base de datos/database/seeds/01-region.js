'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('region', [
      {
        nombre_region: 'Metropolitana',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nombre_region: 'Valparaíso',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nombre_region: 'Biobío',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('region', null, {});
  }
};
