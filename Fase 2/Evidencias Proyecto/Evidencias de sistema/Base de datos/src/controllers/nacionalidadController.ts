import { Request, Response } from 'express';
import { Nacionalidad } from '@/models';
import { sendSuccess, sendError } from '@/utils/response';
import { Logger } from '@/utils/logger';

export class NacionalidadController {
    /**
     * Obtener todas las nacionalidades
     */
    static async getAll(req: Request, res: Response) {
        try {
            const nacionalidades = await Nacionalidad.findAll({
                order: [['nombre_nacionalidad', 'ASC']]
            });

            return sendSuccess(res, nacionalidades);
        } catch (error: any) {
            Logger.error('Error al obtener nacionalidades:', error);
            return sendError(res, 'Error al obtener nacionalidades', 500);
        }
    }
}

