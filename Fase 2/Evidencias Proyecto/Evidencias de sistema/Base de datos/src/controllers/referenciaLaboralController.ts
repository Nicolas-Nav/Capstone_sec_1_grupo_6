import { Request, Response } from 'express';
import { sendSuccess, sendError } from '@/utils/response';
import { Logger } from '@/utils/logger';
import { ReferenciaLaboralService } from '@/services/referenciaLaboralService';

/**
 * Controlador para gestión de Referencias Laborales
 */

export class ReferenciaLaboralController {
    /**
     * GET /api/referencias-laborales
     * Obtener todas las referencias laborales
     */
    static async getAll(req: Request, res: Response): Promise<Response> {
        try {
            const referencias = await ReferenciaLaboralService.getAllReferencias();
            return sendSuccess(res, referencias, 'Referencias laborales obtenidas exitosamente');
        } catch (error) {
            Logger.error('Error al obtener referencias laborales:', error);
            return sendError(res, 'Error al obtener referencias laborales', 500);
        }
    }

    /**
     * GET /api/referencias-laborales/candidato/:idCandidato
     * Obtener referencias por candidato
     */
    static async getByCandidato(req: Request, res: Response): Promise<Response> {
        try {
            const { idCandidato } = req.params;
            const referencias = await ReferenciaLaboralService.getReferenciasByCandidato(parseInt(idCandidato));
            return sendSuccess(res, referencias, 'Referencias obtenidas exitosamente');
        } catch (error) {
            Logger.error('Error al obtener referencias:', error);
            return sendError(res, 'Error al obtener referencias', 500);
        }
    }

    /**
     * GET /api/referencias-laborales/:id
     * Obtener una referencia específica
     */
    static async getById(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const referencia = await ReferenciaLaboralService.getReferenciaById(parseInt(id));

            if (!referencia) {
                return sendError(res, 'Referencia laboral no encontrada', 404);
            }

            return sendSuccess(res, referencia, 'Referencia obtenida exitosamente');
        } catch (error) {
            Logger.error('Error al obtener referencia:', error);
            return sendError(res, 'Error al obtener referencia', 500);
        }
    }

    /**
     * POST /api/referencias-laborales
     * Crear nueva referencia laboral
     */
    static async create(req: Request, res: Response): Promise<Response> {
        try {
            const referencia = await ReferenciaLaboralService.createReferencia(req.body);
            return sendSuccess(res, referencia, 'Referencia creada exitosamente', 201);
        } catch (error) {
            Logger.error('Error al crear referencia:', error);
            return sendError(res, (error as Error).message || 'Error al crear referencia', 500);
        }
    }

    /**
     * POST /api/referencias-laborales/multiples
     * Crear múltiples referencias para un candidato
     */
    static async createMultiples(req: Request, res: Response): Promise<Response> {
        try {
            const { id_candidato, referencias } = req.body;
            
            if (!referencias || !Array.isArray(referencias)) {
                return sendError(res, 'Debe proporcionar un array de referencias', 400);
            }

            const referenciasCreadas = await ReferenciaLaboralService.createMultiplesReferencias(
                parseInt(id_candidato),
                referencias
            );
            
            return sendSuccess(res, referenciasCreadas, 'Referencias creadas exitosamente', 201);
        } catch (error) {
            Logger.error('Error al crear referencias:', error);
            return sendError(res, (error as Error).message || 'Error al crear referencias', 500);
        }
    }

    /**
     * PUT /api/referencias-laborales/:id
     * Actualizar referencia laboral
     */
    static async update(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const referencia = await ReferenciaLaboralService.updateReferencia(parseInt(id), req.body);
            return sendSuccess(res, referencia, 'Referencia actualizada exitosamente');
        } catch (error) {
            Logger.error('Error al actualizar referencia:', error);
            return sendError(res, (error as Error).message || 'Error al actualizar referencia', 500);
        }
    }

    /**
     * DELETE /api/referencias-laborales/:id
     * Eliminar referencia laboral
     */
    static async delete(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            await ReferenciaLaboralService.deleteReferencia(parseInt(id));
            return sendSuccess(res, null, 'Referencia eliminada exitosamente');
        } catch (error) {
            Logger.error('Error al eliminar referencia:', error);
            return sendError(res, (error as Error).message || 'Error al eliminar referencia', 500);
        }
    }
}

