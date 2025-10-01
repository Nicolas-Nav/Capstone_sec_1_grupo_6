import { Request, Response } from 'express';
import { sendSuccess, sendError } from '@/utils/response';
import { Logger } from '@/utils/logger';
import { TipoServicioService } from '@/services/tipoServicioService';

/**
 * Controlador para gestión de Tipos de Servicio
 * Delega la lógica de negocio al TipoServicioService
 */

export class TipoServicioController {
    /**
     * GET /api/tipos-servicio
     * Obtener todos los tipos de servicio
     */
    static async getAll(req: Request, res: Response): Promise<Response> {
        try {
            const tiposServicio = await TipoServicioService.getAllTiposServicio();
            return sendSuccess(res, tiposServicio, 'Tipos de servicio obtenidos exitosamente');
        } catch (error) {
            Logger.error('Error al obtener tipos de servicio:', error);
            return sendError(res, 'Error al obtener tipos de servicio', 500);
        }
    }

    /**
     * GET /api/tipos-servicio/:codigo
     * Obtener un tipo de servicio específico
     */
    static async getByCodigo(req: Request, res: Response): Promise<Response> {
        try {
            const { codigo } = req.params;
            const tipoServicio = await TipoServicioService.getTipoServicioByCodigo(codigo);

            if (!tipoServicio) {
                return sendError(res, 'Tipo de servicio no encontrado', 404);
            }

            return sendSuccess(res, tipoServicio, 'Tipo de servicio obtenido exitosamente');
        } catch (error) {
            Logger.error('Error al obtener tipo de servicio:', error);
            return sendError(res, 'Error al obtener tipo de servicio', 500);
        }
    }

    /**
     * POST /api/tipos-servicio
     * Crear nuevo tipo de servicio
     */
    static async create(req: Request, res: Response): Promise<Response> {
        try {
            const { codigo, nombre } = req.body;
            const nuevoTipo = await TipoServicioService.createTipoServicio({ codigo, nombre });

            Logger.info(`Tipo de servicio creado: ${nuevoTipo.codigo}`);
            return sendSuccess(res, nuevoTipo, 'Tipo de servicio creado exitosamente', 201);
        } catch (error: any) {
            Logger.error('Error al crear tipo de servicio:', error);

            if (error.name === 'SequelizeUniqueConstraintError') {
                return sendError(res, 'Ya existe un tipo de servicio con ese código o nombre', 400);
            }

            return sendError(res, error.message || 'Error al crear tipo de servicio', 400);
        }
    }

    /**
     * PUT /api/tipos-servicio/:codigo
     * Actualizar tipo de servicio
     */
    static async update(req: Request, res: Response): Promise<Response> {
        try {
            const { codigo } = req.params;
            const { nombre } = req.body;

            const tipoActualizado = await TipoServicioService.updateTipoServicio(codigo, { nombre });

            Logger.info(`Tipo de servicio actualizado: ${codigo}`);
            return sendSuccess(res, tipoActualizado, 'Tipo de servicio actualizado exitosamente');
        } catch (error: any) {
            Logger.error('Error al actualizar tipo de servicio:', error);

            if (error.name === 'SequelizeUniqueConstraintError') {
                return sendError(res, 'Ya existe un tipo de servicio con ese nombre', 400);
            }

            if (error.message === 'Tipo de servicio no encontrado') {
                return sendError(res, error.message, 404);
            }

            return sendError(res, error.message || 'Error al actualizar tipo de servicio', 400);
        }
    }

    /**
     * DELETE /api/tipos-servicio/:codigo
     * Eliminar tipo de servicio
     */
    static async delete(req: Request, res: Response): Promise<Response> {
        try {
            const { codigo } = req.params;
            await TipoServicioService.deleteTipoServicio(codigo);

            Logger.info(`Tipo de servicio eliminado: ${codigo}`);
            return sendSuccess(res, null, 'Tipo de servicio eliminado exitosamente');
        } catch (error: any) {
            Logger.error('Error al eliminar tipo de servicio:', error);

            if (error.message === 'Tipo de servicio no encontrado') {
                return sendError(res, error.message, 404);
            }

            if (error.message.includes('solicitudes asociadas')) {
                return sendError(res, error.message, 400);
            }

            return sendError(res, 'Error al eliminar tipo de servicio', 500);
        }
    }
}

