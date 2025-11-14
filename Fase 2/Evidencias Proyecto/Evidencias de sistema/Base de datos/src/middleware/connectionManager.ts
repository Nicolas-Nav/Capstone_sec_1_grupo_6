import { Request, Response, NextFunction } from 'express';
import sequelize from '@/config/database';
import { Logger } from '@/utils/logger';

/**
 * Middleware para manejar conexiones de base de datos
 * Monitorea y gestiona el pool de conexiones
 */
export const connectionManager = (req: Request, res: Response, next: NextFunction) => {
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