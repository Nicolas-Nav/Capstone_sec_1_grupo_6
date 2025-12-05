import { Request, Response } from 'express';
import { Rubro } from '@/models';
import { sendSuccess, sendError } from '@/utils/response';
import { Logger } from '@/utils/logger';

export class RubroController {
    /**
     * Obtener todos los rubros
     */
    static async getAll(req: Request, res: Response) {
        try {
            const rubros = await Rubro.findAll({
                order: [['nombre_rubro', 'ASC']]
            });

            return sendSuccess(res, rubros);
        } catch (error: any) {
            Logger.error('Error al obtener rubros:', error);
            return sendError(res, 'Error al obtener rubros', 500);
        }
    }
}

