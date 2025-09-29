import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from '@/config';
import { Logger } from '@/utils/logger';
import { errorHandler, notFoundHandler } from '@/middleware/errorHandler';

// Importar rutas (se crearán después)
// import authRoutes from '@/routes/auth';
// import userRoutes from '@/routes/users';
// import clientRoutes from '@/routes/clients';
// import processRoutes from '@/routes/processes';
// import candidateRoutes from '@/routes/candidates';

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
      auth: '/api/auth',
      users: '/api/users',
      clients: '/api/clients',
      processes: '/api/processes',
      candidates: '/api/candidates'
    }
  });
});

// Rutas de la API (se descomentarán cuando se creen)
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/clients', clientRoutes);
// app.use('/api/processes', processRoutes);
// app.use('/api/candidates', candidateRoutes);

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
    Logger.info('🚀 Inicializando aplicación LL Consulting...');
    
    // Aquí se pueden agregar inicializaciones adicionales
    // como conexión a base de datos, etc.
    
    Logger.info('✅ Aplicación inicializada correctamente');
  } catch (error) {
    Logger.error('❌ Error al inicializar la aplicación:', error);
    throw error;
  }
};

export default app;
