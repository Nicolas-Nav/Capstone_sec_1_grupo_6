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
                Logger.debug(`Conexiones activas: ${pool.size}/${pool.max}`);
            }
        } catch (error) {
            // Ignorar errores de acceso al pool
        }
    }

    next();
};

/**
 * Función para limpiar conexiones inactivas
 * Nota: Sequelize maneja automáticamente el pool de conexiones
 */
export const cleanupConnections = async () => {
    try {
        // Sequelize maneja automáticamente las conexiones inactivas
        // No necesitamos limpiar manualmente el pool
        const pool = (sequelize as any).connectionManager.pool;
        if (pool) {
            Logger.debug(`Pool stats: ${pool.size}/${pool.max} conexiones activas`);
        }
    } catch (error) {
        Logger.error('Error obteniendo estadísticas del pool:', error);
    }
};

/**
 * Función para obtener estadísticas del pool
 */
export const getPoolStats = () => {
    try {
        const pool = (sequelize as any).connectionManager.pool;
        if (!pool) return null;

        return {
            size: pool.size,
            max: pool.max,
            min: pool.min,
            used: pool.size,
            available: pool.max - pool.size
        };
    } catch (error) {
        return null;
    }
};