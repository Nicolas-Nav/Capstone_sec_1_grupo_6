import { Request, Response } from 'express';
import { sendSuccess, sendError } from '@/utils/response';
import { Logger } from '@/utils/logger';
import { CandidatoService } from '@/services/candidatoService';

/**
 * Controlador para gestión de Candidatos
 * Delega la lógica de negocio al CandidatoService
 */

export class CandidatoController {
    /**
     * GET /api/candidatos
     * Obtener todos los candidatos
     */
    static async getAll(req: Request, res: Response): Promise<Response> {
        try {
            const { email, rut, comuna } = req.query;
            
            const candidatos = await CandidatoService.getAllCandidatos({
                email: email as string,
                rut: rut as string,
                comuna: comuna as string
            });

            return sendSuccess(res, candidatos, 'Candidatos obtenidos exitosamente');
        } catch (error) {
            Logger.error('Error al obtener candidatos:', error);
            return sendError(res, 'Error al obtener candidatos', 500);
        }
    }

    /**
     * GET /api/candidatos/:id
     * Obtener un candidato específico
     */
    static async getById(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const candidato = await CandidatoService.getCandidatoById(parseInt(id));

            if (!candidato) {
                return sendError(res, 'Candidato no encontrado', 404);
            }

            return sendSuccess(res, candidato, 'Candidato obtenido exitosamente');
        } catch (error) {
            Logger.error('Error al obtener candidato:', error);
            return sendError(res, 'Error al obtener candidato', 500);
        }
    }

    /**
     * GET /api/candidatos/email/:email
     * Buscar candidato por email
     */
    static async getByEmail(req: Request, res: Response): Promise<Response> {
        try {
            const { email } = req.params;
            const candidato = await CandidatoService.getCandidatoByEmailFormatted(email);

            if (!candidato) {
                return sendError(res, 'Candidato no encontrado', 404);
            }

            return sendSuccess(res, candidato, 'Candidato obtenido exitosamente');
        } catch (error) {
            Logger.error('Error al buscar candidato:', error);
            return sendError(res, 'Error al buscar candidato', 500);
        }
    }

    /**
     * POST /api/candidatos
     * Crear nuevo candidato
     */
    static async create(req: Request, res: Response): Promise<Response> {
        try {
            const {
                name,
                email,
                phone,
                rut,
                birth_date,
                comuna,
                nacionalidad,
                rubro,
                profession,
                english_level,
                software_tools,
                has_driving_license,
                has_disability_credential,
                work_experience,
                education
            } = req.body;

            const nuevoCandidato = await CandidatoService.createCandidato({
                name,
                email,
                phone,
                rut,
                birth_date,
                comuna,
                nacionalidad,
                rubro,
                profession,
                english_level,
                software_tools,
                has_driving_license,
                has_disability_credential,
                work_experience,
                education
            });

            Logger.info(`Candidato creado: ${nuevoCandidato.id}`);
            return sendSuccess(res, nuevoCandidato, 'Candidato creado exitosamente', 201);
        } catch (error: any) {
            Logger.error('Error al crear candidato:', error);
            
            if (error.message === 'Ya existe un candidato con este email') {
                return sendError(res, error.message, 400);
            }
            
            return sendError(res, error.message || 'Error al crear candidato', 400);
        }
    }

    /**
     * PUT /api/candidatos/:id
     * Actualizar candidato
     */
    static async update(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const {
                name,
                email,
                phone,
                rut,
                birth_date,
                comuna,
                nacionalidad,
                rubro,
                english_level,
                software_tools,
                has_driving_license,
                has_disability_credential
            } = req.body;

            const candidatoActualizado = await CandidatoService.updateCandidato(parseInt(id), {
                name,
                email,
                phone,
                rut,
                birth_date,
                comuna,
                nacionalidad,
                rubro,
                english_level,
                software_tools,
                has_driving_license,
                has_disability_credential
            });

            Logger.info(`Candidato actualizado: ${id}`);
            return sendSuccess(res, candidatoActualizado, 'Candidato actualizado exitosamente');
        } catch (error: any) {
            Logger.error('Error al actualizar candidato:', error);
            
            if (error.message === 'Candidato no encontrado') {
                return sendError(res, error.message, 404);
            }
            
            return sendError(res, error.message || 'Error al actualizar candidato', 400);
        }
    }

    /**
     * DELETE /api/candidatos/:id
     * Eliminar candidato
     */
    static async delete(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            await CandidatoService.deleteCandidato(parseInt(id));

            Logger.info(`Candidato eliminado: ${id}`);
            return sendSuccess(res, null, 'Candidato eliminado exitosamente');
        } catch (error: any) {
            Logger.error('Error al eliminar candidato:', error);
            
            if (error.message === 'Candidato no encontrado') {
                return sendError(res, error.message, 404);
            }
            
            if (error.message.includes('postulaciones asociadas')) {
                return sendError(res, error.message, 400);
            }
            
            return sendError(res, 'Error al eliminar candidato', 500);
        }
    }

    /**
     * EXPERIENCIAS LABORALES
     */

    /**
     * GET /api/candidatos/:id/experiencias
     * Obtener experiencias de un candidato
     */
    static async getExperiencias(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const experiencias = await CandidatoService.getExperiencias(parseInt(id));

            return sendSuccess(res, experiencias, 'Experiencias obtenidas exitosamente');
        } catch (error) {
            Logger.error('Error al obtener experiencias:', error);
            return sendError(res, 'Error al obtener experiencias', 500);
        }
    }

    /**
     * POST /api/candidatos/:id/experiencias
     * Agregar experiencias a un candidato
     */
    static async addExperiencias(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const { experiencias } = req.body;

            await CandidatoService.addExperiencias(parseInt(id), experiencias);

            Logger.info(`Experiencias agregadas al candidato: ${id}`);
            return sendSuccess(res, null, 'Experiencias agregadas exitosamente', 201);
        } catch (error: any) {
            Logger.error('Error al agregar experiencias:', error);
            return sendError(res, error.message || 'Error al agregar experiencias', 400);
        }
    }

    /**
     * PUT /api/candidatos/:id/experiencias/:idExp
     * Actualizar experiencia
     */
    static async updateExperiencia(req: Request, res: Response): Promise<Response> {
        try {
            const { idExp } = req.params;
            const experienciaData = req.body;

            await CandidatoService.updateExperiencia(parseInt(idExp), experienciaData);

            Logger.info(`Experiencia actualizada: ${idExp}`);
            return sendSuccess(res, null, 'Experiencia actualizada exitosamente');
        } catch (error: any) {
            Logger.error('Error al actualizar experiencia:', error);
            
            if (error.message === 'Experiencia no encontrada') {
                return sendError(res, error.message, 404);
            }
            
            return sendError(res, 'Error al actualizar experiencia', 500);
        }
    }

    /**
     * DELETE /api/candidatos/:id/experiencias/:idExp
     * Eliminar experiencia
     */
    static async deleteExperiencia(req: Request, res: Response): Promise<Response> {
        try {
            const { idExp } = req.params;
            await CandidatoService.deleteExperiencia(parseInt(idExp));

            Logger.info(`Experiencia eliminada: ${idExp}`);
            return sendSuccess(res, null, 'Experiencia eliminada exitosamente');
        } catch (error: any) {
            Logger.error('Error al eliminar experiencia:', error);
            
            if (error.message === 'Experiencia no encontrada') {
                return sendError(res, error.message, 404);
            }
            
            return sendError(res, 'Error al eliminar experiencia', 500);
        }
    }

    /**
     * POST /api/candidatos/:id/educacion
     * Agregar educación a un candidato
     */
    static async addEducacion(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const { educacion } = req.body;

            await CandidatoService.addEducacion(parseInt(id), educacion);

            Logger.info(`Educación agregada al candidato: ${id}`);
            return sendSuccess(res, null, 'Educación agregada exitosamente', 201);
        } catch (error: any) {
            Logger.error('Error al agregar educación:', error);
            return sendError(res, error.message || 'Error al agregar educación', 400);
        }
    }

    /**
     * POST /api/candidatos/:id/profesion
     * Agregar profesión a un candidato
     */
    static async addProfesion(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const { profesion, institucion } = req.body;

            await CandidatoService.addProfesion(parseInt(id), profesion, institucion);

            Logger.info(`Profesión agregada al candidato: ${id}`);
            return sendSuccess(res, null, 'Profesión agregada exitosamente', 201);
        } catch (error: any) {
            Logger.error('Error al agregar profesión:', error);
            return sendError(res, error.message || 'Error al agregar profesión', 400);
        }
    }
}

