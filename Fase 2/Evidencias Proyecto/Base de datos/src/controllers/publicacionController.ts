import { Request, Response } from 'express';
import { sendSuccess, sendError } from '@/utils/response';
import { Logger } from '@/utils/logger';
import { PublicacionService } from '@/services/publicacionService';

/**
 * Controlador para gestión de Publicaciones
 */

export class PublicacionController {
    /**
     * GET /api/publicaciones
     * Obtener todas las publicaciones con filtros opcionales
     */
    static async getAll(req: Request, res: Response): Promise<Response> {
        try {
            const { solicitud_id, portal_id, estado } = req.query;

            const publicaciones = await PublicacionService.getAllPublicaciones({
                solicitud_id: solicitud_id ? parseInt(solicitud_id as string) : undefined,
                portal_id: portal_id ? parseInt(portal_id as string) : undefined,
                estado: estado as string
            });

            return sendSuccess(res, publicaciones, 'Publicaciones obtenidas exitosamente');
        } catch (error: any) {
            Logger.error('Error al obtener publicaciones:', error);
            return sendError(res, error.message || 'Error al obtener publicaciones', 500);
        }
    }

    /**
     * GET /api/publicaciones/portales
     * Obtener todos los portales de postulación
     */
    static async getPortales(req: Request, res: Response): Promise<Response> {
        try {
            const portales = await PublicacionService.getAllPortales();
            return sendSuccess(res, portales, 'Portales obtenidos exitosamente');
        } catch (error: any) {
            Logger.error('Error al obtener portales:', error);
            return sendError(res, error.message || 'Error al obtener portales', 500);
        }
    }

    /**
     * GET /api/publicaciones/:id
     * Obtener una publicación específica
     */
    static async getById(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const publicacion = await PublicacionService.getPublicacionById(parseInt(id));

            if (!publicacion) {
                return sendError(res, 'Publicación no encontrada', 404);
            }

            return sendSuccess(res, publicacion, 'Publicación obtenida exitosamente');
        } catch (error: any) {
            Logger.error('Error al obtener publicación:', error);
            return sendError(res, error.message || 'Error al obtener publicación', 500);
        }
    }

    /**
     * POST /api/publicaciones
     * Crear una nueva publicación
     */
    static async create(req: Request, res: Response): Promise<Response> {
        try {
            const { id_solicitud, id_portal_postulacion, url_publicacion, estado_publicacion, fecha_publicacion } = req.body;

            const result = await PublicacionService.createPublicacion({
                id_solicitud,
                id_portal_postulacion,
                url_publicacion,
                estado_publicacion,
                fecha_publicacion
            });

            Logger.info(`Publicación creada: ${result.id}`);
            return sendSuccess(res, result, 'Publicación creada exitosamente', 201);
        } catch (error: any) {
            Logger.error('Error al crear publicación:', error);

            if (error.message === 'Solicitud no encontrada' || error.message === 'Portal de postulación no encontrado') {
                return sendError(res, error.message, 404);
            }

            if (error.message === 'Faltan campos requeridos') {
                return sendError(res, error.message, 400);
            }

            return sendError(res, error.message || 'Error al crear publicación', 500);
        }
    }

    /**
     * PUT /api/publicaciones/:id
     * Actualizar una publicación
     */
    static async update(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const { url_publicacion, estado_publicacion, fecha_publicacion } = req.body;

            const result = await PublicacionService.updatePublicacion(parseInt(id), {
                url_publicacion,
                estado_publicacion,
                fecha_publicacion
            });

            Logger.info(`Publicación actualizada: ${id}`);
            return sendSuccess(res, result, 'Publicación actualizada exitosamente');
        } catch (error: any) {
            Logger.error('Error al actualizar publicación:', error);

            if (error.message === 'Publicación no encontrada') {
                return sendError(res, error.message, 404);
            }

            return sendError(res, error.message || 'Error al actualizar publicación', 500);
        }
    }

    /**
     * DELETE /api/publicaciones/:id
     * Eliminar una publicación
     */
    static async delete(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const result = await PublicacionService.deletePublicacion(parseInt(id));

            Logger.info(`Publicación eliminada: ${id}`);
            return sendSuccess(res, result, 'Publicación eliminada exitosamente');
        } catch (error: any) {
            Logger.error('Error al eliminar publicación:', error);

            if (error.message === 'Publicación no encontrada') {
                return sendError(res, error.message, 404);
            }

            return sendError(res, error.message || 'Error al eliminar publicación', 500);
        }
    }
}

