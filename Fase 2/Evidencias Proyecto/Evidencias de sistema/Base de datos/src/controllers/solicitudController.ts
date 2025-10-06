import { Request, Response } from 'express';
import { sendSuccess, sendError } from '@/utils/response';
import { Logger } from '@/utils/logger';
import { SolicitudService } from '@/services/solicitudService';

/**
 * Controlador para gestión de Solicitudes (Process en frontend)
 * Delega la lógica de negocio al SolicitudService
 */

export class SolicitudController {
    /**
     * GET /api/solicitudes
     * Obtener todas las solicitudes con información completa
     */
    static async getAll(req: Request, res: Response): Promise<Response> {
        try {
            const { status, service_type, consultor_id } = req.query;
            
            const solicitudes = await SolicitudService.getAllSolicitudes({
                status: status as string,
                service_type: service_type as string,
                consultor_id: consultor_id as string
            });

            return sendSuccess(res, solicitudes, 'Solicitudes obtenidas exitosamente');
        } catch (error) {
            Logger.error('Error al obtener solicitudes:', error);
            return sendError(res, 'Error al obtener solicitudes', 500);
        }
    }

    /**
     * GET /api/solicitudes/:id
     * Obtener una solicitud específica
     */
    static async getById(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const solicitud = await SolicitudService.getSolicitudById(parseInt(id));

            if (!solicitud) {
                return sendError(res, 'Solicitud no encontrada', 404);
            }

            return sendSuccess(res, solicitud, 'Solicitud obtenida exitosamente');
        } catch (error) {
            Logger.error('Error al obtener solicitud:', error);
            return sendError(res, 'Error al obtener solicitud', 500);
        }
    }

    /**
     * GET /api/solicitudes/consultor/:rutUsuario
     * Obtener solicitudes por consultor
     */
    static async getByConsultor(req: Request, res: Response): Promise<Response> {
        try {
            const { rutUsuario } = req.params;
            const { status } = req.query;

            const solicitudes = await SolicitudService.getAllSolicitudes({
                consultor_id: rutUsuario,
                status: status as string
            });

            return sendSuccess(res, solicitudes, 'Solicitudes obtenidas exitosamente');
        } catch (error) {
            Logger.error('Error al obtener solicitudes por consultor:', error);
            return sendError(res, 'Error al obtener solicitudes', 500);
        }
    }

    /**
     * POST /api/solicitudes
     * Crear nueva solicitud con descripción de cargo
     */
    static async create(req: Request, res: Response): Promise<Response> {
        try {
            const {
                contact_id,
                service_type,
                position_title,
                description,
                requirements,
                vacancies,
                consultant_id,
                deadline_days
            } = req.body;

            const nuevaSolicitud = await SolicitudService.createSolicitud({
                contact_id: parseInt(contact_id),
                service_type,
                position_title,
                description,
                requirements,
                vacancies: vacancies ? parseInt(vacancies) : undefined,
                consultant_id,
                deadline_days: deadline_days ? parseInt(deadline_days) : undefined
            });

            Logger.info(`Solicitud creada: ${nuevaSolicitud.id}`);
            return sendSuccess(res, nuevaSolicitud, 'Solicitud creada exitosamente', 201);
        } catch (error: any) {
            Logger.error('Error al crear solicitud:', error);
            return sendError(res, error.message || 'Error al crear solicitud', 400);
        }
    }

    /**
     * PUT /api/solicitudes/:id/estado
     * Cambiar estado de la solicitud (Abierto, En Progreso, Cerrado, Congelado)
     */
    static async updateEstado(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const { status, reason } = req.body;

            await SolicitudService.updateEstado(parseInt(id), { status, reason });

            Logger.info(`Estado actualizado para solicitud ${id}: ${status}`);
            return sendSuccess(res, null, 'Estado actualizado exitosamente');
        } catch (error: any) {
            Logger.error('Error al actualizar estado:', error);
            
            if (error.message === 'Solicitud no encontrada') {
                return sendError(res, error.message, 404);
            }
            
            if (error.message === 'Estado no válido') {
                return sendError(res, error.message, 400);
            }
            
            return sendError(res, 'Error al actualizar estado', 500);
        }
    }

    /**
     * PUT /api/solicitudes/:id/etapa
     * Cambiar etapa de la solicitud (Módulo 1, 2, 3, 4, 5)
     */
    static async cambiarEtapa(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const { id_etapa } = req.body;

            const resultado = await SolicitudService.cambiarEtapa(parseInt(id), parseInt(id_etapa));

            Logger.info(`Etapa actualizada para solicitud ${id}: ${resultado.etapa}`);
            return sendSuccess(res, resultado, 'Etapa actualizada exitosamente');
        } catch (error: any) {
            Logger.error('Error al cambiar etapa:', error);
            
            if (error.message === 'Solicitud no encontrada' || error.message === 'Etapa no encontrada') {
                return sendError(res, error.message, 404);
            }
            
            return sendError(res, 'Error al cambiar etapa', 500);
        }
    }

    /**
     * DELETE /api/solicitudes/:id
     * Eliminar solicitud
     */
    static async delete(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            await SolicitudService.deleteSolicitud(parseInt(id));

            Logger.info(`Solicitud eliminada: ${id}`);
            return sendSuccess(res, null, 'Solicitud eliminada exitosamente');
        } catch (error: any) {
            Logger.error('Error al eliminar solicitud:', error);
            
            if (error.message === 'Solicitud no encontrada') {
                return sendError(res, error.message, 404);
            }
            
            return sendError(res, 'Error al eliminar solicitud', 500);
        }
    }
}
