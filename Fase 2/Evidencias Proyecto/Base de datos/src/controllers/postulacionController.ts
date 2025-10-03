import { Request, Response } from 'express';
import { sendSuccess, sendError } from '@/utils/response';
import { Logger } from '@/utils/logger';
import { PostulacionService } from '@/services/postulacionService';
import { handleMulterError } from '@/config/multer';

/**
 * Controlador para gestión de Postulaciones y Candidatos
 * Delega la lógica de negocio al PostulacionService
 */

export class PostulacionController {
    /**
     * GET /api/postulaciones/solicitud/:idSolicitud
     * Obtener todas las postulaciones de una solicitud
     */
    static async getBySolicitud(req: Request, res: Response): Promise<Response> {
        try {
            const { idSolicitud } = req.params;
            const candidatos = await PostulacionService.getPostulacionesBySolicitud(parseInt(idSolicitud));

            return sendSuccess(res, candidatos, 'Candidatos obtenidos exitosamente');
        } catch (error) {
            Logger.error('Error al obtener candidatos:', error);
            return sendError(res, 'Error al obtener candidatos', 500);
        }
    }

    /**
     * POST /api/postulaciones
     * Crear nueva postulación con candidato
     */
    static async create(req: Request, res: Response): Promise<Response> {
        try {
            const {
                process_id,
                name,
                email,
                phone,
                birth_date,
                comuna,
                profession,
                source_portal,
                consultant_rating,
                consultant_comment,
                motivation,
                salary_expectation,
                availability,
                family_situation,
                english_level,
                software_tools,
                has_driving_license,
                has_disability_credential,
                work_experience,
                education
            } = req.body;

            // Obtener el archivo CV si se subió
            const cvFile = req.file ? req.file.buffer : undefined;

            const nuevaPostulacion = await PostulacionService.createPostulacion({
                process_id: parseInt(process_id),
                name,
                email,
                phone,
                birth_date,
                comuna,
                profession,
                source_portal,
                consultant_rating: consultant_rating ? parseInt(consultant_rating) : undefined,
                consultant_comment,
                motivation,
                salary_expectation: salary_expectation ? parseFloat(salary_expectation) : undefined,
                availability,
                family_situation,
                english_level,
                software_tools,
                has_driving_license,
                has_disability_credential,
                cv_file: cvFile,
                work_experience,
                education
            });

            Logger.info(`Postulación creada: ${nuevaPostulacion.id}`);
            return sendSuccess(
                res,
                nuevaPostulacion,
                'Postulación creada exitosamente',
                201
            );
        } catch (error: any) {
            Logger.error('Error al crear postulación:', error);

            if (error.name === 'SequelizeUniqueConstraintError') {
                return sendError(res, 'El candidato ya está postulado a esta solicitud', 400);
            }

            return sendError(res, error.message || 'Error al crear postulación', 400);
        }
    }

    /**
     * PUT /api/postulaciones/:id/estado
     * Actualizar estado de la postulación
     */
    static async updateEstado(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const { presentation_status, rejection_reason } = req.body;

            await PostulacionService.updateEstado(parseInt(id), {
                presentation_status,
                rejection_reason
            });

            Logger.info(`Estado actualizado para postulación ${id}`);
            return sendSuccess(res, null, 'Estado actualizado exitosamente');
        } catch (error: any) {
            Logger.error('Error al actualizar estado:', error);

            if (error.message === 'Postulación no encontrada') {
                return sendError(res, error.message, 404);
            }

            if (error.message === 'Estado no válido') {
                return sendError(res, error.message, 400);
            }

            return sendError(res, 'Error al actualizar estado', 500);
        }
    }

    /**
     * PUT /api/postulaciones/:id/valoracion
     * Actualizar valoración del consultor
     */
    static async updateValoracion(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const { rating } = req.body;

            await PostulacionService.updateValoracion(parseInt(id), parseInt(rating));

            Logger.info(`Valoración actualizada para postulación ${id}: ${rating}`);
            return sendSuccess(res, null, 'Valoración actualizada exitosamente');
        } catch (error: any) {
            Logger.error('Error al actualizar valoración:', error);

            if (error.message === 'Postulación no encontrada') {
                return sendError(res, error.message, 404);
            }

            if (error.message.includes('valoración')) {
                return sendError(res, error.message, 400);
            }

            return sendError(res, 'Error al actualizar valoración', 500);
        }
    }

    /**
     * DELETE /api/postulaciones/:id
     * Eliminar postulación
     */
    static async delete(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            await PostulacionService.deletePostulacion(parseInt(id));

            Logger.info(`Postulación eliminada: ${id}`);
            return sendSuccess(res, null, 'Postulación eliminada exitosamente');
        } catch (error: any) {
            Logger.error('Error al eliminar postulación:', error);

            if (error.message === 'Postulación no encontrada') {
                return sendError(res, error.message, 404);
            }

            return sendError(res, 'Error al eliminar postulación', 500);
        }
    }

    /**
     * POST /api/postulaciones/:id/cv
     * Subir o actualizar CV de postulación
     */
    static async uploadCV(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;

            if (!req.file) {
                return sendError(res, 'No se proporcionó ningún archivo', 400);
            }

            await PostulacionService.uploadCV(parseInt(id), req.file.buffer);

            Logger.info(`CV actualizado para postulación ${id}`);
            return sendSuccess(res, null, 'CV actualizado exitosamente');
        } catch (error: any) {
            Logger.error('Error al subir CV:', error);

            // Manejar errores de Multer
            if (error.message && error.message.includes('Solo se permiten')) {
                return sendError(res, error.message, 400);
            }

            if (error.message === 'Postulación no encontrada') {
                return sendError(res, error.message, 404);
            }

            return sendError(res, handleMulterError(error), 500);
        }
    }

    /**
     * GET /api/postulaciones/:id/cv
     * Descargar CV de postulación
     */
    static async downloadCV(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;

            const { cv, filename } = await PostulacionService.getCV(parseInt(id));

            // Establecer headers para descarga
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Length', cv.length);

            Logger.info(`CV descargado para postulación ${id}: ${filename}`);
            return res.send(cv);
        } catch (error: any) {
            Logger.error('Error al descargar CV:', error);

            if (error.message === 'Postulación no encontrada') {
                return sendError(res, error.message, 404);
            }

            if (error.message === 'La postulación no tiene CV') {
                return sendError(res, error.message, 404);
            }

            return sendError(res, 'Error al descargar CV', 500);
        }
    }
}
