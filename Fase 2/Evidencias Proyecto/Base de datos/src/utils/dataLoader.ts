import { sequelize } from '@/config/database';
import { 
  Region, Comuna, Usuario, Cliente, Contacto, 
  TipoServicio, Cargo, DescripcionCargo, Solicitud,
  Candidato, Postulacion, EstadoCandidato, PortalPostulacion
} from '@/models';

/**
 * Clase para cargar datos con manejo automático de dependencias
 */
export class DataLoader {
  
  /**
   * Cargar datos básicos (sin dependencias)
   */
  static async loadBasicData() {
    const transaction = await sequelize.transaction();
    
    try {
      // 1. Regiones
      const regiones = await Region.bulkCreate([
        { nombre_region: 'Metropolitana' },
        { nombre_region: 'Valparaíso' },
        { nombre_region: 'Biobío' }
      ], { transaction });

      // 2. Comunas (dependen de regiones)
      const comunas = await Comuna.bulkCreate([
        { nombre_comuna: 'Santiago', id_region: regiones[0].id_region },
        { nombre_comuna: 'Las Condes', id_region: regiones[0].id_region },
        { nombre_comuna: 'Valparaíso', id_region: regiones[1].id_region }
      ], { transaction });

      // 3. Tipos de servicio
      const tiposServicio = await TipoServicio.bulkCreate([
        { codigo_servicio: 'PC', nombre_servicio: 'Proceso Completo' },
        { codigo_servicio: 'LL', nombre_servicio: 'Long List' },
        { codigo_servicio: 'TR', nombre_servicio: 'Targeted Recruitment' },
        { codigo_servicio: 'EP', nombre_servicio: 'Evaluación Psicolaboral' },
        { codigo_servicio: 'TP', nombre_servicio: 'Test Psicolaboral' }
      ], { transaction });

      // 4. Estados de candidato
      const estadosCandidato = await EstadoCandidato.bulkCreate([
        { nombre_estado_candidato: 'Postulado' },
        { nombre_estado_candidato: 'Presentado' },
        { nombre_estado_candidato: 'Aprobado' },
        { nombre_estado_candidato: 'Rechazado' }
      ], { transaction });

      // 5. Portales de postulación
      const portales = await PortalPostulacion.bulkCreate([
        { nombre_portal_postulacion: 'LinkedIn' },
        { nombre_portal_postulacion: 'GetOnBoard' },
        { nombre_portal_postulacion: 'Indeed' },
        { nombre_portal_postulacion: 'Trabajando.com' }
      ], { transaction });

      await transaction.commit();
      
      return {
        regiones,
        comunas,
        tiposServicio,
        estadosCandidato,
        portales
      };
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Cargar datos de usuarios y clientes
   */
  static async loadUserData() {
    const transaction = await sequelize.transaction();
    
    try {
      // 1. Usuarios
      const usuarios = await Usuario.bulkCreate([
        {
          rut_usuario: '12.345.678-9',
          nombre_usuario: 'Admin',
          apellido_usuario: 'Sistema',
          email_usuario: 'admin@llconsulting.cl',
          contrasena_usuario: 'admin123',
          activo_usuario: true,
          rol_usuario: 1
        },
        {
          rut_usuario: '98.765.432-1',
          nombre_usuario: 'Consultor',
          apellido_usuario: 'Demo',
          email_usuario: 'consultor@llconsulting.cl',
          contrasena_usuario: 'consultor123',
          activo_usuario: true,
          rol_usuario: 2
        }
      ], { transaction });

      // 2. Clientes
      const clientes = await Cliente.bulkCreate([
        { nombre_cliente: 'Empresa ABC' },
        { nombre_cliente: 'Corporación XYZ' },
        { nombre_cliente: 'Startup Tech' }
      ], { transaction });

      await transaction.commit();
      
      return { usuarios, clientes };
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Cargar datos de procesos (dependen de usuarios, clientes, etc.)
   */
  static async loadProcessData() {
    const transaction = await sequelize.transaction();
    
    try {
      // Obtener datos existentes
      const comunas = await Comuna.findAll();
      const clientes = await Cliente.findAll();
      const usuarios = await Usuario.findAll();
      const tiposServicio = await TipoServicio.findAll();
      
      if (comunas.length === 0 || clientes.length === 0 || usuarios.length === 0) {
        throw new Error('Primero debe ejecutar loadBasicData() y loadUserData()');
      }

      // 1. Cargos
      const cargos = await Cargo.bulkCreate([
        { nombre_cargo: 'Desarrollador Full Stack' },
        { nombre_cargo: 'Diseñador UX/UI' },
        { nombre_cargo: 'Product Manager' },
        { nombre_cargo: 'Data Analyst' }
      ], { transaction });

      // 2. Descripciones de cargo (dependen de cargos y comunas)
      const descripcionesCargo = await DescripcionCargo.bulkCreate([
        {
          descripcion_cargo: 'Desarrollador Full Stack con experiencia en React y Node.js',
          requisitos_y_condiciones: '3+ años de experiencia, conocimiento en TypeScript',
          num_vacante: 2,
          fecha_ingreso: new Date('2024-12-01'),
          id_cargo: cargos[0].id_cargo,
          id_ciudad: comunas[0].id_ciudad
        }
      ], { transaction });

      // 3. Contactos (dependen de clientes y comunas)
      const contactos = await Contacto.bulkCreate([
        {
          nombre_contacto: 'Ana García',
          email_contacto: 'ana@empresaabc.cl',
          telefono_contacto: '+56912345678',
          cargo_contacto: 'Gerente de RRHH',
          id_cliente: clientes[0].id_cliente,
          id_ciudad: comunas[0].id_ciudad
        }
      ], { transaction });

      // 4. Solicitudes (dependen de contactos, tipos de servicio, etc.)
      const solicitudes = await Solicitud.bulkCreate([
        {
          plazo_maximo_solicitud: new Date('2024-12-31'),
          fecha_ingreso_solicitud: new Date(),
          id_contacto: contactos[0].id_contacto,
          codigo_servicio: tiposServicio[0].codigo_servicio,
          id_descripcioncargo: descripcionesCargo[0].id_descripcioncargo,
          rut_usuario: usuarios[0].rut_usuario,
          id_etapa_solicitud: 1
        }
      ], { transaction });

      await transaction.commit();
      
      return {
        cargos,
        descripcionesCargo,
        contactos,
        solicitudes
      };
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Cargar todos los datos en el orden correcto
   */
  static async loadAllData() {
    try {
      console.log('🔄 Cargando datos básicos...');
      const basicData = await this.loadBasicData();
      
      console.log('🔄 Cargando datos de usuarios...');
      const userData = await this.loadUserData();
      
      console.log('🔄 Cargando datos de procesos...');
      const processData = await this.loadProcessData();
      
      console.log('✅ Todos los datos cargados correctamente');
      
      return {
        ...basicData,
        ...userData,
        ...processData
      };
      
    } catch (error) {
      console.error('❌ Error al cargar datos:', error);
      throw error;
    }
  }
}
