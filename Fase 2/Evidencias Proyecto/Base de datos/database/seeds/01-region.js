'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('region', [
      { nombre_region: 'Arica y Parinacota' },
      { nombre_region: 'Tarapacá' },
      { nombre_region: 'Antofagasta' },
      { nombre_region: 'Atacama' },
      { nombre_region: 'Coquimbo' },
      { nombre_region: 'Valparaíso' },
      { nombre_region: 'Metropolitana de Santiago' },
      { nombre_region: 'Libertador General Bernardo O\'Higgins' },
      { nombre_region: 'Maule' },
      { nombre_region: 'Ñuble' },
      { nombre_region: 'Biobío' },
      { nombre_region: 'La Araucanía' },
      { nombre_region: 'Los Ríos' },
      { nombre_region: 'Los Lagos' },
      { nombre_region: 'Aysén del General Carlos Ibáñez del Campo' },
      { nombre_region: 'Magallanes y de la Antártica Chilena' }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('region', null, {});
  }
};