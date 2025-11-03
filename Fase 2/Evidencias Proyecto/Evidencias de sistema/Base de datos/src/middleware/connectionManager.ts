import { Request, Response, NextFunction } from 'express';
import sequelize from '@/config/database';
import { Logger } from '@/utils/logger';

/**
 * Middleware para manejar conexiones de base de datos
 * Monitorea y gestiona el pool de conexiones
 */
export const connectionManager = (req: Request, res: Response, next: NextFunction) => {
    // Log de conexiones activas (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
        try {
            // Acceder al pool de manera segura
            const pool = (sequelize as any).connectionManager.pool;
            if (pool) {
                // Intentar obtener el máximo del pool (puede estar en diferentes propiedades según la versión de Sequelize)
                const poolMax = pool.max || pool._config?.max || (sequelize as any).config?.pool?.max || 'N/A';
                Logger.debug(`Conexiones activas: ${pool.size}/${poolMax}`);
            }
        } catch (error) {
            // Ignorar errores de acceso al pool
        }
    }

    // Agregar listener para cuando la respuesta termine
    res.on('finish', () => {
        // Forzar liberación de conexiones inactivas
        try {
            const pool = (sequelize as any).connectionManager.pool;
            if (pool) {
                pool.clear();
            }
        } catch (error) {
            // Ignorar errores de limpieza
        }
    });

    next();
};

/**
 * Función para limpiar conexiones inactivas
 */
export const cleanupConnections = async () => {
    try {
        const pool = (sequelize as any).connectionManager.pool;
        if (pool && pool.size > 0) {
            Logger.info(`Limpiando ${pool.size} conexiones inactivas`);
            await pool.clear();
        }
    } catch (error) {
        Logger.error('Error limpiando conexiones:', error);
    }
};

/**
 * Función para obtener estadísticas del pool
 */
export const getPoolStats = () => {
    try {
        const pool = (sequelize as any).connectionManager.pool;
        if (!pool) return null;

        // Intentar obtener el máximo del pool desde diferentes fuentes
        const poolMax = pool.max || pool._config?.max || (sequelize as any).config?.pool?.max || 20;
        const poolMin = pool.min || pool._config?.min || (sequelize as any).config?.pool?.min || 2;

        return {
            size: pool.size,
            max: poolMax,
            min: poolMin,
            used: pool.size,
            available: poolMax - pool.size
        };
    } catch (error) {
        return null;
    }
};