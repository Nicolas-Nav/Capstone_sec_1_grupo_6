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
            
            // Headers para evitar caché y asegurar datos frescos
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            
            const candidatos = await PostulacionService.getPostulacionesBySolicitud(parseInt(idSolicitud));

            return sendSuccess(res, candidatos, 'Candidatos obtenidos exitosamente');
        } catch (error: any) {
            Logger.error('Error al obtener candidatos:', error);
            console.error('❌ ERROR DETALLADO:', error);
            return sendError(res, error?.message || 'Error al obtener candidatos', 500);
        }
    }

    /**
     * GET /api/postulaciones/solicitud/:idSolicitud/optimized
     * Obtener postulaciones optimizadas (sin datos de formación académica)
     */
    static async getBySolicitudOptimized(req: Request, res: Response): Promise<Response> {
        try {
            const { idSolicitud } = req.params;
            const candidatos = await PostulacionService.getPostulacionesBySolicitudOptimized(parseInt(idSolicitud));

            return sendSuccess(res, candidatos, 'Candidatos obtenidos exitosamente (optimizado)');
        } catch (error) {
            Logger.error('Error al obtener candidatos optimizados:', error);
            return sendError(res, 'Error al obtener candidatos', 500);
        }
    }

    /**
     * POST /api/postulaciones
     * Crear nueva postulación con candidato
     */
    static async create(req: Request, res: Response): Promise<Response> {
        try {
            const { id_candidato, id_solicitud, id_portal_postulacion, id_estado_candidato } = req.body;
            
            // Obtener el archivo CV si se subió
            const cvFile = req.file ? req.file.buffer : undefined;

            // Caso 1: Crear postulación para candidato existente
            if (id_candidato) {
                const {
                    motivacion,
                    expectativa_renta,
                    disponibilidad_postulacion,
                    valoracion,
                    comentario_no_presentado,
                    situacion_familiar
                } = req.body;

                const nuevaPostulacion = await PostulacionService.createPostulacionDirecta({
                    id_candidato: parseInt(id_candidato),
                    id_solicitud: parseInt(id_solicitud),
                    id_portal_postulacion: id_portal_postulacion ? parseInt(id_portal_postulacion) : undefined,
                    id_estado_candidato: id_estado_candidato ? parseInt(id_estado_candidato) : 1, // Por defecto: 1 = Presentado
                    motivacion,
                    expectativa_renta: expectativa_renta ? parseFloat(expectativa_renta) : undefined,
                    disponibilidad_postulacion,
                    valoracion: valoracion ? parseInt(valoracion) : undefined,
                    comentario_no_presentado,
                    situacion_familiar,
                    cv_file: cvFile
                });

                Logger.info(`Postulación creada para candidato existente: ${nuevaPostulacion.id}`);
                return sendSuccess(res, nuevaPostulacion, 'Postulación creada exitosamente', 201);
            }

            // Caso 2: Crear candidato + postulación
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

            Logger.info(`Postulación creada con nuevo candidato: ${nuevaPostulacion.id}`);
            return sendSuccess(res, nuevaPostulacion, 'Postulación creada exitosamente', 201);
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
     * Actualizar valoración y otros campos de postulación
     */
    static async updateValoracion(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const { 
                rating, 
                valoracion, 
                motivacion, 
                expectativa_renta, 
                disponibilidad_postulacion,
                situacion_familiar,
                comentario_no_presentado 
            } = req.body;

            console.log('🔍 === ACTUALIZANDO VALORACIÓN ===');
            console.log('🔍 ID de postulación:', id);
            console.log('🔍 Body recibido:', JSON.stringify(req.body, null, 2));
            console.log('🔍 Rating recibido:', rating);
            console.log('🔍 Valoracion recibida:', valoracion);

            // Compatibilidad: rating o valoracion
            const finalRating = valoracion || rating;
            
            console.log('🔍 Valoración final a guardar:', finalRating);

            await PostulacionService.updateValoracion(parseInt(id), {
                valoracion: finalRating ? parseInt(finalRating) : undefined,
                motivacion,
                expectativa_renta: expectativa_renta ? parseFloat(expectativa_renta) : undefined,
                disponibilidad_postulacion,
                situacion_familiar,
                comentario_no_presentado
            }, req.user?.id);

            Logger.info(`Postulación actualizada ${id}`);
            return sendSuccess(res, null, 'Postulación actualizada exitosamente');
        } catch (error: any) {
            Logger.error('Error al actualizar postulación:', error);

            if (error.message === 'Postulación no encontrada') {
                return sendError(res, error.message, 404);
            }

            if (error.message.includes('valoración')) {
                return sendError(res, error.message, 400);
            }

            return sendError(res, 'Error al actualizar postulación', 500);
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
