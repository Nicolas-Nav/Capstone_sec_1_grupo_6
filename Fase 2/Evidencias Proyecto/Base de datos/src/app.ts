import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from '@/config';
import { Logger } from '@/utils/logger';
import { errorHandler, notFoundHandler } from '@/middleware/errorHandler';

// Importar rutas
// import authRoutes from '@/routes/auth';
// import userRoutes from '@/routes/users';
import clienteRoutes from '@/routes/clientes';
import solicitudRoutes from '@/routes/solicitudes';
import postulacionRoutes from '@/routes/postulaciones';

const app = express();

// ===========================================
// MIDDLEWARE DE SEGURIDAD
// ===========================================

// Helmet para headers de seguridad
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS
app.use(cors({
  origin: config.server.frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    message: 'Demasiadas peticiones desde esta IP, intenta de nuevo más tarde'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// ===========================================
// MIDDLEWARE DE PARSING
// ===========================================

// Compresión
app.use(compression());

// Parse JSON
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ===========================================
// MIDDLEWARE DE LOGGING
// ===========================================

// Morgan para logging de requests
if (config.server.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ===========================================
// RUTAS
// ===========================================

// Ruta de salud
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: config.server.nodeEnv
  });
});

// Ruta de información de la API
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'API de LL Consulting',
    version: '1.0.0',
    endpoints: {
      clientes: '/api/clientes',
      solicitudes: '/api/solicitudes',
      postulaciones: '/api/postulaciones',
      auth: '/api/auth (TODO)',
      users: '/api/users (TODO)'
    },
    documentation: {
      clientes: {
        getAll: 'GET /api/clientes',
        getById: 'GET /api/clientes/:id',
        create: 'POST /api/clientes',
        update: 'PUT /api/clientes/:id',
        delete: 'DELETE /api/clientes/:id',
        stats: 'GET /api/clientes/stats'
      },
      solicitudes: {
        getAll: 'GET /api/solicitudes',
        getById: 'GET /api/solicitudes/:id',
        getByConsultor: 'GET /api/solicitudes/consultor/:rutUsuario',
        create: 'POST /api/solicitudes',
        updateEstado: 'PUT /api/solicitudes/:id/estado',
        delete: 'DELETE /api/solicitudes/:id'
      },
      postulaciones: {
        getBySolicitud: 'GET /api/postulaciones/solicitud/:idSolicitud',
        create: 'POST /api/postulaciones',
        updateEstado: 'PUT /api/postulaciones/:id/estado',
        updateValoracion: 'PUT /api/postulaciones/:id/valoracion',
        delete: 'DELETE /api/postulaciones/:id'
      }
    }
  });
});

// Rutas de la API
// app.use('/api/auth', authRoutes); // TODO: Implementar autenticación
// app.use('/api/users', userRoutes); // TODO: Implementar gestión de usuarios
app.use('/api/clientes', clienteRoutes);
app.use('/api/solicitudes', solicitudRoutes);
app.use('/api/postulaciones', postulacionRoutes);

// ===========================================
// MIDDLEWARE DE ERRORES
// ===========================================

// Manejar rutas no encontradas
app.use(notFoundHandler);

// Manejo global de errores
app.use(errorHandler);

// ===========================================
// INICIALIZACIÓN
// ===========================================

// Función para inicializar la aplicación
export const initializeApp = async (): Promise<void> => {
  try {
    Logger.info('Inicializando aplicación LL Consulting...');
    
    // Aquí se pueden agregar inicializaciones adicionales
    // como conexión a base de datos, etc.
    
    Logger.info('✅ Aplicación inicializada correctamente');
  } catch (error) {
    Logger.error('❌ Error al inicializar la aplicación:', error);
    throw error;
  }
};

export default app;
