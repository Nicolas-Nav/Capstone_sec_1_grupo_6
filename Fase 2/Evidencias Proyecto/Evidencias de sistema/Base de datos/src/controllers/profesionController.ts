import { Request, Response } from 'express';
import { Profesion } from '@/models';
import { sendSuccess, sendError } from '@/utils/response';
import { Logger } from '@/utils/logger';

export class ProfesionController {
    /**
     * Obtener todas las profesiones
     */
    static async getAll(req: Request, res: Response) {
        try {
            const profesiones = await Profesion.findAll({
                order: [['nombre_profesion', 'ASC']]
            });

            Logger.info(`Se obtuvieron ${profesiones.length} profesiones`);
            return sendSuccess(res, profesiones);
        } catch (error: any) {
            Logger.error('Error al obtener profesiones:', error);
            return sendError(res, 'Error al obtener profesiones', 500);
        }
    }
}

