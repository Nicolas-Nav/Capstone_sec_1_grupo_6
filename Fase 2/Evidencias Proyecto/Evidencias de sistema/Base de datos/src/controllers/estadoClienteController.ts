import { Request, Response } from 'express';
import { sendSuccess, sendError } from '@/utils/response';
import { Logger } from '@/utils/logger';
import { EstadoClienteService } from '@/services/estadoClienteService';

export class EstadoClienteController {
    /**
     * Obtener todos los estados de cliente
     */
    static async getAll(req: Request, res: Response): Promise<Response> {
        try {
            const estados = await EstadoClienteService.getAll();
            return sendSuccess(res, estados, 'Estados de cliente obtenidos exitosamente');
        } catch (error: any) {
            Logger.error('Error al obtener estados de cliente:', error);
            return sendError(res, 'Error al obtener estados de cliente', 500);
        }
    }

    /**
     * Cambiar estado de cliente para una postulación
     */
    static async cambiarEstado(req: Request, res: Response): Promise<Response> {
        try {
            const { id_postulacion } = req.params;
            const { id_estado_cliente, comentarios, fecha_presentacion, fecha_feedback_cliente } = req.body;

            if (!id_estado_cliente) {
                return sendError(res, 'El estado del cliente es requerido', 400);
            }

            const result = await EstadoClienteService.cambiarEstado(
                parseInt(id_postulacion),
                {
                    id_estado_cliente,
                    comentarios,
                    fecha_presentacion,
                    fecha_feedback_cliente
                },
                req.user?.id
            );

            Logger.info(`Estado de cliente cambiado para postulación ${id_postulacion}`);
            return sendSuccess(res, result, 'Estado de cliente actualizado exitosamente');
        } catch (error: any) {
            Logger.error('Error al cambiar estado de cliente:', error);
            
            if (error.message === 'Postulación no encontrada') {
                return sendError(res, error.message, 404);
            }
            
            if (error.message === 'Estado de cliente no encontrado') {
                return sendError(res, error.message, 404);
            }
            
            if (error.message.includes('obligatorios')) {
                return sendError(res, error.message, 400);
            }
            
            return sendError(res, 'Error al cambiar estado de cliente', 500);
        }
    }

    /**
     * Obtener historial de cambios de estado para una postulación
     */
    static async getHistorial(req: Request, res: Response): Promise<Response> {
        try {
            const { id_postulacion } = req.params;
            const historial = await EstadoClienteService.getHistorial(parseInt(id_postulacion));
            return sendSuccess(res, historial, 'Historial de estados obtenido exitosamente');
        } catch (error: any) {
            Logger.error('Error al obtener historial de estados:', error);
            return sendError(res, 'Error al obtener historial de estados', 500);
        }
    }
}
