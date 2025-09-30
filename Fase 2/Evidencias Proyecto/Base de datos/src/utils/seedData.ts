import { sequelize } from '@/config/database';
import { Region, Comuna, Usuario, Cliente, Contacto } from '@/models';

/**
 * Función para cargar datos iniciales con manejo de dependencias
 */
export const seedInitialData = async () => {
  const transaction = await sequelize.transaction();
  
  try {
    // 1. Crear regiones
    const regionMetropolitana = await Region.create({
      nombre_region: 'Metropolitana'
    }, { transaction });

    const regionValparaiso = await Region.create({
      nombre_region: 'Valparaíso'
    }, { transaction });

    // 2. Crear comunas (dependen de regiones)
    const comunaSantiago = await Comuna.create({
      nombre_comuna: 'Santiago',
      id_region: regionMetropolitana.id_region
    }, { transaction });

    const comunaValparaiso = await Comuna.create({
      nombre_comuna: 'Valparaíso',
      id_region: regionValparaiso.id_region
    }, { transaction });

    // 3. Crear usuarios
    const usuarioAdmin = await Usuario.create({
      rut_usuario: '12.345.678-9',
      nombre_usuario: 'Admin',
      apellido_usuario: 'Sistema',
      email_usuario: 'admin@llconsulting.cl',
      contrasena_usuario: 'admin123',
      activo_usuario: true,
      rol_usuario: 1 // Admin
    }, { transaction });

    // 4. Crear clientes
    const clienteABC = await Cliente.create({
      nombre_cliente: 'Empresa ABC'
    }, { transaction });

    // 5. Crear contactos (dependen de clientes y comunas)
    const contactoAna = await Contacto.create({
      nombre_contacto: 'Ana García',
      email_contacto: 'ana@empresaabc.cl',
      telefono_contacto: '+56912345678',
      cargo_contacto: 'Gerente de RRHH',
      id_cliente: clienteABC.id_cliente,
      id_ciudad: comunaSantiago.id_ciudad
    }, { transaction });

    // Confirmar transacción
    await transaction.commit();
    
    console.log('✅ Datos iniciales cargados correctamente');
    
    return {
      regiones: [regionMetropolitana, regionValparaiso],
      comunas: [comunaSantiago, comunaValparaiso],
      usuarios: [usuarioAdmin],
      clientes: [clienteABC],
      contactos: [contactoAna]
    };
    
  } catch (error) {
    // Revertir transacción en caso de error
    await transaction.rollback();
    console.error('❌ Error al cargar datos iniciales:', error);
    throw error;
  }
};

/**
 * Función para cargar datos de prueba
 */
export const seedTestData = async () => {
  const transaction = await sequelize.transaction();
  
  try {
    // Obtener datos existentes
    const regiones = await Region.findAll();
    const comunas = await Comuna.findAll();
    const usuarios = await Usuario.findAll();
    const clientes = await Cliente.findAll();
    
    if (regiones.length === 0 || comunas.length === 0) {
      throw new Error('Primero debe ejecutar seedInitialData()');
    }
    
    // Crear más datos de prueba...
    // (Aquí puedes agregar más datos de prueba)
    
    await transaction.commit();
    console.log('✅ Datos de prueba cargados correctamente');
    
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Error al cargar datos de prueba:', error);
    throw error;
  }
};
