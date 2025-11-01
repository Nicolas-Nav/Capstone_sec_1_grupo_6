import { Transaction, Sequelize } from 'sequelize';
import sequelize from '@/config/database';

/**
 * Utilidad para configurar el usuario actual en la base de datos
 * para que los triggers de log puedan capturar el RUT del usuario
 */

/**
 * Configura el usuario actual en la sesión de PostgreSQL
 * Esto permite que los triggers capturen el RUT del usuario que realiza la operación
 * 
 * @param rutUsuario RUT del usuario (PK de la tabla usuario)
 * @param transaction Transacción de Sequelize (opcional)
 */
export async function setCurrentUser(
    rutUsuario: string,
    transaction?: Transaction
): Promise<void> {
    try {
        // Escapar el RUT para prevenir SQL injection
        const rutEscapado = rutUsuario.replace(/'/g, "''");
        
        // Configurar variable de sesión en PostgreSQL
        // 'LOCAL' hace que la variable sea específica de esta transacción
        if (transaction) {
            await sequelize.query(
                `SET LOCAL app.current_user = '${rutEscapado}'`,
                { transaction }
            );
        } else {
            await sequelize.query(
                `SET app.current_user = '${rutEscapado}'`
            );
        }
    } catch (error) {
        console.error('Error al configurar usuario en BD:', error);
        // No lanzar error para no interrumpir el flujo
        // Los triggers usarán 'system' como fallback
    }
}

/**
 * Limpia el usuario actual de la sesión
 * Útil al finalizar operaciones
 * 
 * @param transaction Transacción de Sequelize (opcional)
 */
export async function clearCurrentUser(transaction?: Transaction): Promise<void> {
    try {
        if (transaction) {
            await sequelize.query(`RESET LOCAL app.current_user`, { transaction });
        } else {
            await sequelize.query(`RESET app.current_user`);
        }
    } catch (error) {
        // Ignorar errores al limpiar
    }
}

/**
 * Crea una transacción con el usuario configurado automáticamente
 * 
 * @param rutUsuario RUT del usuario
 * @param callback Función que recibe la transacción y realiza las operaciones
 * @returns Resultado de la función callback
 */
export async function withUserTransaction<T>(
    rutUsuario: string,
    callback: (transaction: Transaction) => Promise<T>
): Promise<T> {
    const transaction = await sequelize.transaction();
    
    try {
        // Configurar usuario antes de ejecutar operaciones
        await setCurrentUser(rutUsuario, transaction);
        
        // Ejecutar operaciones con el callback
        const result = await callback(transaction);
        
        // Commit si todo salió bien
        await transaction.commit();
        
        return result;
    } catch (error) {
        // Rollback en caso de error
        await transaction.rollback();
        throw error;
    }
}

/**
 * Helper para obtener el RUT del usuario desde el request (si está autenticado)
 * Útil en controladores
 * 
 * @param req Request de Express con user en req.user
 * @returns RUT del usuario o null
 */
export function getUserRutFromRequest(req: any): string | null {
    // Intentar obtener el RUT de diferentes lugares comunes
    if (req?.user?.id) {
        return req.user.id; // JWT suele tener el RUT en 'id'
    }
    if (req?.user?.rut_usuario) {
        return req.user.rut_usuario;
    }
    if (req?.body?.consultant_id || req?.body?.rut_usuario) {
        return req.body.consultant_id || req.body.rut_usuario;
    }
    if (req?.query?.consultant_id || req?.query?.rut_usuario) {
        return req.query.consultant_id || req.query.rut_usuario;
    }
    
    return null;
}

/**
 * Obtener el RUT del consultor asignado a una solicitud
 * Útil cuando se necesita usar el consultor asignado en lugar del usuario autenticado
 * 
 * @param solicitud Solicitud con rut_usuario
 * @returns RUT del consultor asignado
 */
export function getConsultorFromSolicitud(solicitud: any): string | null {
    return solicitud?.rut_usuario || solicitud?.consultant_id || null;
}

