import { Request, Response } from 'express';
import { sendSuccess, sendError } from '@/utils/response';
import { Logger } from '@/utils/logger';
import { EstadoContratacionService } from '@/services/estadoContratacionService';

/**
 * Controlador para gestión de Estados de Contratación
 * Los estados están PRE-CARGADOS en la BD y solo se SELECCIONAN desde el frontend
 * Los métodos de creación/edición/eliminación son solo para administración
 */

export class EstadoContratacionController {
    // ===========================================
    // MÉTODOS DE CONSULTA (Para el frontend)
    // ===========================================

    /**
     * GET /api/estados-contratacion
     * Obtener todos los estados disponibles (para selección)
     */
    static async getAll(req: Request, res: Response): Promise<Response> {
        try {
            const estados = await EstadoContratacionService.getAllEstados();
            return sendSuccess(res, estados, 'Estados obtenidos exitosamente');
        } catch (error) {
            Logger.error('Error al obtener estados:', error);
            return sendError(res, 'Error al obtener estados', 500);
        }
    }

    /**
     * GET /api/estados-contratacion/:id
     * Obtener un estado específico
     */
    static async getById(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const estado = await EstadoContratacionService.getEstadoById(parseInt(id));

            if (!estado) {
                return sendError(res, 'Estado no encontrado', 404);
            }

            return sendSuccess(res, estado, 'Estado obtenido exitosamente');
        } catch (error) {
            Logger.error('Error al obtener estado:', error);
            return sendError(res, 'Error al obtener estado', 500);
        }
    }

    // ===========================================
    // MÉTODOS DE ADMINISTRACIÓN (Solo para admin/seed)
    // ===========================================

    /**
     * POST /api/estados-contratacion
     * Crear nuevo estado (SOLO ADMIN)
     */
    static async create(req: Request, res: Response): Promise<Response> {
        try {
            const estado = await EstadoContratacionService.createEstado(req.body);
            return sendSuccess(res, estado, 'Estado creado exitosamente', 201);
        } catch (error) {
            Logger.error('Error al crear estado:', error);
            return sendError(res, (error as Error).message || 'Error al crear estado', 500);
        }
    }

    /**
     * PUT /api/estados-contratacion/:id
     * Actualizar estado (SOLO ADMIN)
     */
    static async update(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const estado = await EstadoContratacionService.updateEstado(parseInt(id), req.body);
            return sendSuccess(res, estado, 'Estado actualizado exitosamente');
        } catch (error) {
            Logger.error('Error al actualizar estado:', error);
            return sendError(res, (error as Error).message || 'Error al actualizar estado', 500);
        }
    }

    /**
     * DELETE /api/estados-contratacion/:id
     * Eliminar estado (SOLO ADMIN)
     */
    static async delete(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            await EstadoContratacionService.deleteEstado(parseInt(id));
            return sendSuccess(res, null, 'Estado eliminado exitosamente');
        } catch (error) {
            Logger.error('Error al eliminar estado:', error);
            return sendError(res, (error as Error).message || 'Error al eliminar estado', 500);
        }
    }
}

