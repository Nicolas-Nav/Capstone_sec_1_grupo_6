import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { getCurrentUserContext } from '@/utils/userContext';

dotenv.config();

const {
  DB_HOST = 'localhost',
  DB_PORT = '5432',
  DB_NAME = 'llconsulting_db_ORM',
  DB_USER = 'postgres',
  DB_PASSWORD = '',
  NODE_ENV = 'development'
} = process.env;

// Configuración de la base de datos
const sequelize = new Sequelize({
  database: DB_NAME,
  username: DB_USER,
  password: DB_PASSWORD,
  host: DB_HOST,
  port: parseInt(DB_PORT),
  dialect: 'postgres',
  logging: NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10, // Reducido de 20 a 10 para evitar exceder límites
    min: 1,  // Reducido de 2 a 1 para conservar conexiones
    acquire: 30000,
    idle: 5000,  // Reducido de 10000 a 5000 para liberar conexiones más rápido
    evict: 1000
  },
  define: {
    timestamps: false,
    underscored: true
  },
  dialectOptions: DB_HOST !== 'localhost' && DB_HOST !== '127.0.0.1' ? {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  } : {}
});

// ===========================================
// HOOK GLOBAL PARA CONFIGURAR USUARIO EN CADA QUERY
// ===========================================

/**
 * Hook que se ejecuta antes de cada query para configurar el usuario responsable
 * Lee el contexto del usuario establecido por el middleware captureUserContext
 */
sequelize.addHook('beforeQuery', async (options) => {
  const currentUser = getCurrentUserContext();
  
  if (currentUser && options.transaction) {
    try {
      // Escapar el RUT para prevenir SQL injection
      const rutEscapado = currentUser.replace(/'/g, "''");
      
      // Configurar variable de sesión LOCAL para esta transacción
      await sequelize.query(
        `SET LOCAL app.current_user = '${rutEscapado}'`,
        { transaction: options.transaction }
      );
      
      // Log solo en desarrollo
      if (NODE_ENV === 'development') {
        console.log(`📝 [LOG] Usuario ${currentUser} configurado para query en transacción`);
      }
    } catch (error) {
      // No interrumpir la query si falla la configuración del usuario
      console.error('⚠️ Error configurando usuario en query:', error);
    }
  } else if (currentUser && !options.transaction) {
    try {
      // Si no hay transacción, usar SET normal (dura toda la conexión)
      const rutEscapado = currentUser.replace(/'/g, "''");
      
      await sequelize.query(
        `SET app.current_user = '${rutEscapado}'`
      );
      
      if (NODE_ENV === 'development') {
        console.log(`📝 [LOG] Usuario ${currentUser} configurado para query sin transacción`);
      }
    } catch (error) {
      console.error('⚠️ Error configurando usuario en query:', error);
    }
  }
});

// Función para probar la conexión
export const testConnection = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a PostgreSQL establecida correctamente');
  } catch (error) {
    console.error('❌ Error al conectar con PostgreSQL:', error);
    throw error;
  }
};

// Función para sincronizar modelos (solo en desarrollo)
export const syncDatabase = async (): Promise<void> => {
  try {
    if (NODE_ENV === 'development') {
      // OPCIÓN 1: Solo crear tablas si no existen (MANTENER DATOS)
      // await sequelize.sync(); // Comentado temporalmente por conflicto de índices
      
      // OPCIÓN 2: Modificar tablas existentes sin eliminar datos
      //await sequelize.sync({ alter: true });
      
      // OPCIÓN 3: Eliminar y recrear todas las tablas (ELIMINA DATOS)
      // await sequelize.sync({ force: true });
      
      console.log('✅ Base de datos conectada (sincronización desactivada)');
    }
  } catch (error) {
    console.error('❌ Error al sincronizar la base de datos:', error);
    throw error;
  }
};

export default sequelize;
