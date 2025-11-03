import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

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
    max: 5,         // URGENTE: Reducido a 5 por límite de PostgreSQL
    min: 1,         // Reducido a 1 para usar menos conexiones
    acquire: 30000, // 30 segundos para adquirir conexión
    idle: 3000,     // Reducido a 3s - liberar conexiones MUY rápido
    evict: 500      // Revisar cada 0.5s para liberar conexiones
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
