import Region from './Region';
import Comuna from './Comuna';

// ===========================================
// ASOCIACIONES ENTRE MODELOS
// ===========================================

// Una región tiene muchas comunas
Region.hasMany(Comuna, {
  foreignKey: 'id_region',
  as: 'comunas'
});

// Una comuna pertenece a una región
Comuna.belongsTo(Region, {
  foreignKey: 'id_region',
  as: 'region'
});

export { Region, Comuna };
