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
     * Obtener solicitudes paginadas con filtros opcionales
     */
    static async getAll(req: Request, res: Response): Promise<Response> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = (req.query.search as string) || "";
            const status = (req.query.status as "creado" | "en_progreso" | "cerrado" | "congelado") || undefined;
            const service_type = (req.query.service_type as string) || undefined;
            const consultor_id = (req.query.consultor_id as string) || undefined;
            const sortBy = (req.query.sortBy as "fecha" | "cargo" | "cliente") || "fecha";
            const sortOrder = (req.query.sortOrder as "ASC" | "DESC") || "DESC";

            const result = await SolicitudService.getSolicitudes(page, limit, search, status, service_type, consultor_id, sortBy, sortOrder);
            return sendSuccess(res, result, "Solicitudes obtenidas correctamente");
        } catch (error: any) {
            Logger.error('Error al obtener solicitudes:', error);
            return sendError(res, error.message || "Error al obtener solicitudes", 500);
        }
    }

    /**
     * GET /api/solicitudes/all
     * Obtener todas las solicitudes con filtros opcionales (sin paginación)
     */
    static async getAllSolicitudes(req: Request, res: Response): Promise<Response> {
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
            
            // Validar que el ID sea un número válido
            const solicitudId = parseInt(id);
            if (isNaN(solicitudId)) {
                return sendError(res, 'ID de solicitud inválido', 400);
            }
            
            const solicitud = await SolicitudService.getSolicitudById(solicitudId);

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
            const { status, reason, id_estado } = req.body;

            // Si se envía id_estado, usar el método de cambio por ID
            if (id_estado) {
                await SolicitudService.cambiarEstado(parseInt(id), parseInt(id_estado));
                Logger.info(`Estado de solicitud ${id} cambiado a ID: ${id_estado}`);
            } else {
                // Mantener compatibilidad con el método anterior
                await SolicitudService.updateEstado(parseInt(id), { status, reason });
                Logger.info(`Estado actualizado para solicitud ${id}: ${status}`);
            }

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

    /**
     * Avanzar al módulo 2
     */
    static async avanzarAModulo2(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const solicitudId = parseInt(id);

            if (isNaN(solicitudId)) {
                return sendError(res, 'ID de solicitud inválido', 400);
            }

            const result = await SolicitudService.avanzarAModulo2(solicitudId);
            
            Logger.info(`Solicitud ${solicitudId} avanzada al Módulo 2`);
            return sendSuccess(res, result, result.message);
        } catch (error: any) {
            Logger.error('Error al avanzar al módulo 2:', error);
            
            if (error.message === 'Solicitud no encontrada') {
                return sendError(res, error.message, 404);
            }
            
            if (error.message === 'Etapa Módulo 2 no encontrada') {
                return sendError(res, error.message, 404);
            }
            
            return sendError(res, 'Error al avanzar al módulo 2', 500);
        }
    }

    /**
     * Obtener etapas disponibles
     */
    static async getEtapas(req: Request, res: Response): Promise<Response> {
        try {
            const etapas = await SolicitudService.getEtapas();
            
            Logger.info(`Etapas obtenidas: ${etapas.length}`);
            return sendSuccess(res, etapas, 'Etapas obtenidas exitosamente');
        } catch (error: any) {
            Logger.error('Error al obtener etapas:', error);
            return sendError(res, 'Error al obtener etapas', 500);
        }
    }

    /**
     * Obtener estados de solicitud disponibles
     */
    static async getEstadosSolicitud(req: Request, res: Response): Promise<Response> {
        try {
            const estados = await SolicitudService.getEstadosSolicitud();
            
            Logger.info(`Estados de solicitud obtenidos: ${estados.length}`);
            return sendSuccess(res, estados, 'Estados obtenidos exitosamente');
        } catch (error: any) {
            Logger.error('Error al obtener estados de solicitud:', error);
            return sendError(res, 'Error al obtener estados de solicitud', 500);
        }
    }

}
