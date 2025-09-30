'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('comuna', [
      {
        nombre_comuna: 'Santiago',
        id_region: 1, // Metropolitana
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nombre_comuna: 'Las Condes',
        id_region: 1, // Metropolitana
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nombre_comuna: 'Valparaíso',
        id_region: 2, // Valparaíso
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('comuna', null, {});
  }
};
