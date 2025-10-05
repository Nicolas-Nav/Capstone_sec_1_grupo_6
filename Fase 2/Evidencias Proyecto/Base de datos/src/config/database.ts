import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const {
  DB_HOST = 'localhost',
  DB_PORT = '5432',
  DB_NAME = 'respaldo2',
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
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: false,
    underscored: true
  },
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false // permite certificados autofirmados
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
