import { Request, Response } from 'express';
import { Institucion } from '@/models';
import { sendSuccess, sendError } from '@/utils/response';
import { Logger } from '@/utils/logger';

export class InstitucionController {
    /**
     * Obtener todas las instituciones
     */
    static async getAll(req: Request, res: Response) {
        try {
            const instituciones = await Institucion.findAll({
                order: [['nombre_institucion', 'ASC']]
            });

            Logger.info(`Se obtuvieron ${instituciones.length} instituciones`);
            return sendSuccess(res, instituciones);
        } catch (error: any) {
            Logger.error('Error al obtener instituciones:', error);
            return sendError(res, 'Error al obtener instituciones', 500);
        }
    }
}

