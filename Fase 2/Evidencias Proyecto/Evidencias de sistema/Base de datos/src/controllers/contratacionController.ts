import { Request, Response } from 'express';
import { sendSuccess, sendError } from '@/utils/response';
import { Logger } from '@/utils/logger';
import { ContratacionService } from '@/services/contratacionService';

/**
 * Controlador para gestión de Contrataciones
 */

export class ContratacionController {
    /**
     * GET /api/contrataciones
     * Obtener todas las contrataciones
     */
    static async getAll(req: Request, res: Response): Promise<Response> {
        try {
            const contrataciones = await ContratacionService.getAllContrataciones();
            return sendSuccess(res, contrataciones, 'Contrataciones obtenidas exitosamente');
        } catch (error) {
            Logger.error('Error al obtener contrataciones:', error);
            return sendError(res, 'Error al obtener contrataciones', 500);
        }
    }

    /**
     * GET /api/contrataciones/estado/:idEstado
     * Obtener contrataciones por estado
     */
    static async getByEstado(req: Request, res: Response): Promise<Response> {
        try {
            const { idEstado } = req.params;
            const contrataciones = await ContratacionService.getContratacionesByEstado(parseInt(idEstado));
            return sendSuccess(res, contrataciones, 'Contrataciones obtenidas exitosamente');
        } catch (error) {
            Logger.error('Error al obtener contrataciones:', error);
            return sendError(res, 'Error al obtener contrataciones', 500);
        }
    }

    /**
     * GET /api/contrataciones/postulacion/:idPostulacion
     * Obtener contratación por postulación
     */
    static async getByPostulacion(req: Request, res: Response): Promise<Response> {
        try {
            const { idPostulacion } = req.params;
            const contratacion = await ContratacionService.getContratacionByPostulacion(parseInt(idPostulacion));

            if (!contratacion) {
                return sendError(res, 'Contratación no encontrada', 404);
            }

            return sendSuccess(res, contratacion, 'Contratación obtenida exitosamente');
        } catch (error) {
            Logger.error('Error al obtener contratación:', error);
            return sendError(res, 'Error al obtener contratación', 500);
        }
    }

    /**
     * GET /api/contrataciones/:id
     * Obtener una contratación específica
     */
    static async getById(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const contratacion = await ContratacionService.getContratacionById(parseInt(id));

            if (!contratacion) {
                return sendError(res, 'Contratación no encontrada', 404);
            }

            return sendSuccess(res, contratacion, 'Contratación obtenida exitosamente');
        } catch (error) {
            Logger.error('Error al obtener contratación:', error);
            return sendError(res, 'Error al obtener contratación', 500);
        }
    }

    /**
     * GET /api/contrataciones/estadisticas
     * Obtener estadísticas de contrataciones
     */
    static async getEstadisticas(req: Request, res: Response): Promise<Response> {
        try {
            const estadisticas = await ContratacionService.getEstadisticas();
            return sendSuccess(res, estadisticas, 'Estadísticas obtenidas exitosamente');
        } catch (error) {
            Logger.error('Error al obtener estadísticas:', error);
            return sendError(res, 'Error al obtener estadísticas', 500);
        }
    }

    /**
     * POST /api/contrataciones
     * Crear nueva contratación
     */
    static async create(req: Request, res: Response): Promise<Response> {
        try {
            const contratacion = await ContratacionService.createContratacion(req.body);
            return sendSuccess(res, contratacion, 'Contratación creada exitosamente', 201);
        } catch (error) {
            Logger.error('Error al crear contratación:', error);
            return sendError(res, (error as Error).message || 'Error al crear contratación', 500);
        }
    }

    /**
     * PUT /api/contrataciones/:id
     * Actualizar contratación
     */
    static async update(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const contratacion = await ContratacionService.updateContratacion(parseInt(id), req.body);
            return sendSuccess(res, contratacion, 'Contratación actualizada exitosamente');
        } catch (error) {
            Logger.error('Error al actualizar contratación:', error);
            return sendError(res, (error as Error).message || 'Error al actualizar contratación', 500);
        }
    }

    /**
     * PUT /api/contrataciones/:id/estado
     * Actualizar estado de contratación
     */
    static async updateEstado(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const { id_estado } = req.body;
            
            const contratacion = await ContratacionService.updateEstado(parseInt(id), parseInt(id_estado));
            return sendSuccess(res, contratacion, 'Estado actualizado exitosamente');
        } catch (error) {
            Logger.error('Error al actualizar estado:', error);
            return sendError(res, (error as Error).message || 'Error al actualizar estado', 500);
        }
    }

    /**
     * PUT /api/contrataciones/:id/encuesta
     * Registrar encuesta de satisfacción
     */
    static async registrarEncuesta(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const { encuesta } = req.body;
            
            const contratacion = await ContratacionService.registrarEncuesta(parseInt(id), encuesta);
            return sendSuccess(res, contratacion, 'Encuesta registrada exitosamente');
        } catch (error) {
            Logger.error('Error al registrar encuesta:', error);
            return sendError(res, (error as Error).message || 'Error al registrar encuesta', 500);
        }
    }

    /**
     * DELETE /api/contrataciones/:id
     * Eliminar contratación
     */
    static async delete(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            await ContratacionService.deleteContratacion(parseInt(id));
            return sendSuccess(res, null, 'Contratación eliminada exitosamente');
        } catch (error) {
            Logger.error('Error al eliminar contratación:', error);
            return sendError(res, (error as Error).message || 'Error al eliminar contratación', 500);
        }
    }
}

