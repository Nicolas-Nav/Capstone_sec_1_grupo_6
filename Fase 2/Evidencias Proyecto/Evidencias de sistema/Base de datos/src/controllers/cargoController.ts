import { Request, Response } from 'express';
import { sendSuccess, sendError } from '@/utils/response';
import { Logger } from '@/utils/logger';
import { CargoService } from '@/services/cargoService';

/**
 * Controlador para gestión de Cargos
 * Delega la lógica de negocio al CargoService
 */

export class CargoController {
    /**
     * GET /api/cargos
     * Obtener todos los cargos
     */
    static async getAll(req: Request, res: Response): Promise<Response> {
        try {
            const cargos = await CargoService.getAllCargos();
            return sendSuccess(res, cargos, 'Cargos obtenidos exitosamente');
        } catch (error) {
            Logger.error('Error al obtener cargos:', error);
            return sendError(res, 'Error al obtener cargos', 500);
        }
    }

    /**
     * GET /api/cargos/:id
     * Obtener un cargo específico
     */
    static async getById(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const cargo = await CargoService.getCargoById(parseInt(id));

            if (!cargo) {
                return sendError(res, 'Cargo no encontrado', 404);
            }

            return sendSuccess(res, cargo, 'Cargo obtenido exitosamente');
        } catch (error) {
            Logger.error('Error al obtener cargo:', error);
            return sendError(res, 'Error al obtener cargo', 500);
        }
    }

    /**
     * POST /api/cargos
     * Crear nuevo cargo
     */
    static async create(req: Request, res: Response): Promise<Response> {
        try {
            const { nombre } = req.body;
            const nuevoCargo = await CargoService.createCargo({ nombre });

            Logger.info(`Cargo creado: ${nuevoCargo.id}`);
            return sendSuccess(res, nuevoCargo, 'Cargo creado exitosamente', 201);
        } catch (error: any) {
            Logger.error('Error al crear cargo:', error);

            if (error.name === 'SequelizeUniqueConstraintError') {
                return sendError(res, 'Ya existe un cargo con ese nombre', 400);
            }

            return sendError(res, error.message || 'Error al crear cargo', 400);
        }
    }

    /**
     * PUT /api/cargos/:id
     * Actualizar cargo
     */
    static async update(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const { nombre } = req.body;

            const cargoActualizado = await CargoService.updateCargo(parseInt(id), { nombre });

            Logger.info(`Cargo actualizado: ${id}`);
            return sendSuccess(res, cargoActualizado, 'Cargo actualizado exitosamente');
        } catch (error: any) {
            Logger.error('Error al actualizar cargo:', error);

            if (error.name === 'SequelizeUniqueConstraintError') {
                return sendError(res, 'Ya existe un cargo con ese nombre', 400);
            }

            if (error.message === 'Cargo no encontrado') {
                return sendError(res, error.message, 404);
            }

            return sendError(res, error.message || 'Error al actualizar cargo', 400);
        }
    }

    /**
     * DELETE /api/cargos/:id
     * Eliminar cargo
     */
    static async delete(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            await CargoService.deleteCargo(parseInt(id));

            Logger.info(`Cargo eliminado: ${id}`);
            return sendSuccess(res, null, 'Cargo eliminado exitosamente');
        } catch (error: any) {
            Logger.error('Error al eliminar cargo:', error);

            if (error.message === 'Cargo no encontrado') {
                return sendError(res, error.message, 404);
            }

            if (error.message.includes('descripciones de cargo asociadas')) {
                return sendError(res, error.message, 400);
            }

            return sendError(res, 'Error al eliminar cargo', 500);
        }
    }

    /**
     * POST /api/cargos/find-or-create
     * Buscar o crear cargo por nombre
     */
    static async findOrCreate(req: Request, res: Response): Promise<Response> {
        try {
            const { nombre } = req.body;
            
            if (!nombre) {
                return sendError(res, 'El nombre del cargo es requerido', 400);
            }

            const cargo = await CargoService.findOrCreateCargo(nombre);

            return sendSuccess(res, cargo, 'Cargo obtenido/creado exitosamente');
        } catch (error: any) {
            Logger.error('Error al buscar/crear cargo:', error);
            return sendError(res, error.message || 'Error al buscar/crear cargo', 400);
        }
    }
}

