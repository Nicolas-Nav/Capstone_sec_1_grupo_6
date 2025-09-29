import app, { initializeApp } from './app';
import { config } from '@/config';
import { testConnection, syncDatabase } from '@/config/database';
import { Logger } from '@/utils/logger';

/**
 * Función principal para iniciar el servidor
 */
const startServer = async (): Promise<void> => {
  try {
    // Inicializar la aplicación
    await initializeApp();

    // Probar conexión a la base de datos
    await testConnection();

    // Sincronizar modelos (solo en desarrollo)
    if (config.server.nodeEnv === 'development') {
      await syncDatabase();
    }

    // Iniciar el servidor
    const server = app.listen(config.server.port, () => {
      Logger.info(`🚀 Servidor iniciado en puerto ${config.server.port}`);
      Logger.info(`📱 Frontend URL: ${config.server.frontendUrl}`);
      Logger.info(`🌍 Entorno: ${config.server.nodeEnv}`);
      Logger.info(`📊 API disponible en: http://localhost:${config.server.port}/api`);
    });

    // Manejo de cierre graceful
    const gracefulShutdown = (signal: string) => {
      Logger.info(`📡 Recibida señal ${signal}. Cerrando servidor...`);
      
      server.close(() => {
        Logger.info('✅ Servidor cerrado correctamente');
        process.exit(0);
      });

      // Forzar cierre después de 10 segundos
      setTimeout(() => {
        Logger.error('❌ Forzando cierre del servidor');
        process.exit(1);
      }, 10000);
    };

    // Escuchar señales de cierre
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Manejo de errores no capturados
    process.on('uncaughtException', (error) => {
      Logger.error('❌ Excepción no capturada:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      Logger.error('❌ Promesa rechazada no manejada:', { reason, promise });
      process.exit(1);
    });

  } catch (error) {
    Logger.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Iniciar el servidor
startServer();
