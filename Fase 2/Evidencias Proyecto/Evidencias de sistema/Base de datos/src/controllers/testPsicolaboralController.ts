import { Request, Response } from 'express';
import { sendSuccess, sendError } from '@/utils/response';
import { Logger } from '@/utils/logger';
import { TestPsicolaboralService } from '@/services/testPsicolaboralService';

/**
 * Controlador para gestión de Tests Psicolaborales
 * Los tests están PRE-CARGADOS en la BD y solo se SELECCIONAN desde el frontend (Módulo 4)
 * Al crear una evaluación psicolaboral, se ASOCIAN tests con sus resultados
 * Los métodos de creación/edición/eliminación son solo para administración
 */

export class TestPsicolaboralController {
    // ===========================================
    // MÉTODOS DE CONSULTA (Para el frontend - Módulo 4)
    // ===========================================

    /**
     * GET /api/tests-psicolaborales
     * Obtener todos los tests disponibles (para selección en Módulo 4)
     */
    static async getAll(req: Request, res: Response): Promise<Response> {
        try {
            const tests = await TestPsicolaboralService.getAllTests();
            return sendSuccess(res, tests, 'Tests obtenidos exitosamente');
        } catch (error) {
            Logger.error('Error al obtener tests:', error);
            return sendError(res, 'Error al obtener tests', 500);
        }
    }

    /**
     * GET /api/tests-psicolaborales/:id
     * Obtener un test específico
     */
    static async getById(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const test = await TestPsicolaboralService.getTestById(parseInt(id));

            if (!test) {
                return sendError(res, 'Test no encontrado', 404);
            }

            return sendSuccess(res, test, 'Test obtenido exitosamente');
        } catch (error) {
            Logger.error('Error al obtener test:', error);
            return sendError(res, 'Error al obtener test', 500);
        }
    }

    // ===========================================
    // MÉTODOS DE ADMINISTRACIÓN (Solo para admin/seed)
    // ===========================================

    /**
     * POST /api/tests-psicolaborales
     * Crear nuevo test (SOLO ADMIN)
     */
    static async create(req: Request, res: Response): Promise<Response> {
        try {
            const test = await TestPsicolaboralService.createTest(req.body);
            return sendSuccess(res, test, 'Test creado exitosamente', 201);
        } catch (error) {
            Logger.error('Error al crear test:', error);
            return sendError(res, (error as Error).message || 'Error al crear test', 500);
        }
    }

    /**
     * PUT /api/tests-psicolaborales/:id
     * Actualizar test (SOLO ADMIN)
     */
    static async update(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const test = await TestPsicolaboralService.updateTest(parseInt(id), req.body);
            return sendSuccess(res, test, 'Test actualizado exitosamente');
        } catch (error) {
            Logger.error('Error al actualizar test:', error);
            return sendError(res, (error as Error).message || 'Error al actualizar test', 500);
        }
    }

    /**
     * DELETE /api/tests-psicolaborales/:id
     * Eliminar test (SOLO ADMIN)
     */
    static async delete(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            await TestPsicolaboralService.deleteTest(parseInt(id));
            return sendSuccess(res, null, 'Test eliminado exitosamente');
        } catch (error) {
            Logger.error('Error al eliminar test:', error);
            return sendError(res, (error as Error).message || 'Error al eliminar test', 500);
        }
    }
}

