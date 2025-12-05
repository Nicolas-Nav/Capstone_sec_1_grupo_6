import { Request, Response } from 'express';
import { sendSuccess, sendError } from '@/utils/response';
import { Logger } from '@/utils/logger';
import { HitoSolicitudService } from '@/services/hitoSolicitudService';

/**
 * Controlador para gestión de Hitos de Solicitud
 */

export class HitoSolicitudController {
    // ===========================================
    // PLANTILLAS
    // ===========================================

    /**
     * GET /api/hitos-solicitud/plantillas
     * Obtener plantillas de hitos
     */
    static async getPlantillas(req: Request, res: Response): Promise<Response> {
        try {
            const { codigo_servicio } = req.query;
            const plantillas = await HitoSolicitudService.getPlantillas(codigo_servicio as string);
            return sendSuccess(res, plantillas, 'Plantillas obtenidas exitosamente');
        } catch (error) {
            Logger.error('Error al obtener plantillas:', error);
            return sendError(res, 'Error al obtener plantillas', 500);
        }
    }

    /**
     * POST /api/hitos-solicitud/plantillas
     * Crear plantilla de hito
     */
    static async createPlantilla(req: Request, res: Response): Promise<Response> {
        try {
            const plantilla = await HitoSolicitudService.createPlantilla(req.body, req.user?.id);
            return sendSuccess(res, plantilla, 'Plantilla creada exitosamente', 201);
        } catch (error) {
            Logger.error('Error al crear plantilla:', error);
            return sendError(res, (error as Error).message || 'Error al crear plantilla', 500);
        }
    }

    // ===========================================
    // HITOS POR SOLICITUD
    // ===========================================

    /**
     * GET /api/hitos-solicitud/solicitud/:idSolicitud
     * Obtener hitos de una solicitud
     */
    static async getBySolicitud(req: Request, res: Response): Promise<Response> {
        try {
            const { idSolicitud } = req.params;
            const hitos = await HitoSolicitudService.getHitosBySolicitud(parseInt(idSolicitud));
            return sendSuccess(res, hitos, 'Hitos obtenidos exitosamente');
        } catch (error) {
            Logger.error('Error al obtener hitos:', error);
            return sendError(res, 'Error al obtener hitos', 500);
        }
    }

    /**
     * POST /api/hitos-solicitud/copiar-plantillas
     * Copiar plantillas a una solicitud
     * El código de servicio se obtiene automáticamente de la solicitud
     */
    static async copiarPlantillas(req: Request, res: Response): Promise<Response> {
        try {
            const { id_solicitud } = req.body;
            const usuarioRut = (req as any).user?.id;
            
            const hitos = await HitoSolicitudService.copiarPlantillasASolicitud(
                parseInt(id_solicitud),
                usuarioRut
            );
            
            return sendSuccess(res, hitos, 'Hitos creados para la solicitud exitosamente', 201);
        } catch (error) {
            Logger.error('Error al copiar plantillas:', error);
            return sendError(res, (error as Error).message || 'Error al copiar plantillas', 500);
        }
    }

    /**
     * POST /api/hitos-solicitud/activar-evento
     * Activar hitos cuando ocurre un evento ancla
     */
    static async activarEvento(req: Request, res: Response): Promise<Response> {
        try {
            const { id_solicitud, tipo_ancla, fecha_evento } = req.body;
            
            const hitos = await HitoSolicitudService.activarHitosPorEvento(
                parseInt(id_solicitud),
                tipo_ancla,
                new Date(fecha_evento),
                req.user?.id
            );
            
            return sendSuccess(res, hitos, 'Hitos activados exitosamente');
        } catch (error) {
            Logger.error('Error al activar hitos:', error);
            return sendError(res, (error as Error).message || 'Error al activar hitos', 500);
        }
    }

    // ===========================================
    // CONSULTAS PARA DASHBOARD
    // ===========================================

    /**
     * GET /api/hitos-solicitud/vencidos
     * Obtener hitos vencidos/atrasados
     * Si el usuario es admin, muestra todos los hitos vencidos
     */
    static async getVencidos(req: Request, res: Response): Promise<Response> {
        try {
            const { consultor_id } = req.query;
            const isAdmin = req.user?.role === 'admin';
            
            // Si es admin, ignorar consultor_id y mostrar todos
            const consultorIdFiltro = isAdmin ? undefined : (consultor_id as string | undefined);
            
            const hitos = await HitoSolicitudService.getHitosVencidos(consultorIdFiltro);
            return sendSuccess(res, hitos, 'Hitos vencidos obtenidos exitosamente');
        } catch (error) {
            Logger.error('Error al obtener hitos vencidos:', error);
            return sendError(res, 'Error al obtener hitos vencidos', 500);
        }
    }

    /**
     * GET /api/hitos-solicitud/por-vencer
     * Obtener hitos por vencer (en período de aviso)
     * Si el usuario es admin, muestra todos los hitos por vencer
     */
    static async getPorVencer(req: Request, res: Response): Promise<Response> {
        try {
            const { consultor_id } = req.query;
            const isAdmin = req.user?.role === 'admin';
            
            // Si es admin, ignorar consultor_id y mostrar todos
            const consultorIdFiltro = isAdmin ? undefined : (consultor_id as string | undefined);
            
            const hitos = await HitoSolicitudService.getHitosPorVencer(consultorIdFiltro);
            return sendSuccess(res, hitos, 'Hitos por vencer obtenidos exitosamente');
        } catch (error) {
            Logger.error('Error al obtener hitos por vencer:', error);
            return sendError(res, 'Error al obtener hitos por vencer', 500);
        }
    }

    /**
     * GET /api/hitos-solicitud/pendientes
     * Obtener hitos pendientes (no activados)
     * Si el usuario es admin, muestra todos los hitos pendientes
     */
    static async getPendientes(req: Request, res: Response): Promise<Response> {
        try {
            const { consultor_id } = req.query;
            const isAdmin = req.user?.role === 'admin';
            
            // Si es admin, ignorar consultor_id y mostrar todos
            const consultorIdFiltro = isAdmin ? undefined : (consultor_id as string | undefined);
            
            const hitos = await HitoSolicitudService.getHitosPendientes(consultorIdFiltro);
            return sendSuccess(res, hitos, 'Hitos pendientes obtenidos exitosamente');
        } catch (error) {
            Logger.error('Error al obtener hitos pendientes:', error);
            return sendError(res, 'Error al obtener hitos pendientes', 500);
        }
    }

    /**
     * GET /api/hitos-solicitud/completados
     * Obtener hitos completados
     * Si el usuario es admin, muestra todos los hitos completados
     */
    static async getCompletados(req: Request, res: Response): Promise<Response> {
        try {
            const { consultor_id } = req.query;
            const isAdmin = req.user?.role === 'admin';
            
            // Si es admin, ignorar consultor_id y mostrar todos
            const consultorIdFiltro = isAdmin ? undefined : (consultor_id as string | undefined);
            
            const hitos = await HitoSolicitudService.getHitosCompletados(consultorIdFiltro);
            return sendSuccess(res, hitos, 'Hitos completados obtenidos exitosamente');
        } catch (error) {
            Logger.error('Error al obtener hitos completados:', error);
            return sendError(res, 'Error al obtener hitos completados', 500);
        }
    }

    /**
     * GET /api/hitos-solicitud/estadisticas
     * Obtener estadísticas de hitos
     */
    static async getEstadisticas(req: Request, res: Response): Promise<Response> {
        try {
            const stats = await HitoSolicitudService.getEstadisticas();
            return sendSuccess(res, stats, 'Estadísticas obtenidas exitosamente');
        } catch (error) {
            Logger.error('Error al obtener estadísticas:', error);
            return sendError(res, 'Error al obtener estadísticas', 500);
        }
    }

    /**
     * GET /api/hitos-solicitud/alertas
     * Obtener hitos con alertas en tiempo real
     * Si el usuario es admin, muestra todas las alertas de todos los consultores
     */
    static async getAlertas(req: Request, res: Response): Promise<Response> {
        try {
            const { consultor_id } = req.query;
            const isAdmin = req.user?.role === 'admin';
            
            // Si es admin, ignorar el consultor_id y mostrar todas las alertas
            const consultorIdFiltro = isAdmin ? undefined : (consultor_id as string | undefined);
            
            // Obtener hitos por vencer y vencidos
            // Si es admin, no se filtra por consultor (consultorIdFiltro = undefined)
            const [hitosPorVencer, hitosVencidos] = await Promise.all([
                HitoSolicitudService.getHitosPorVencer(consultorIdFiltro),
                HitoSolicitudService.getHitosVencidos(consultorIdFiltro)
            ]);

            // Combinar todos los hitos
            const hitosFiltrados = [...hitosPorVencer, ...hitosVencidos];
            
            // Agrupar por tipo de alerta
            const alertas = {
                por_vencer: hitosFiltrados.filter(h => h.estado === 'por_vencer'),
                vencidos: hitosFiltrados.filter(h => h.estado === 'vencido'),
                total: hitosFiltrados.length,
                timestamp: new Date().toISOString()
            };

            return sendSuccess(res, alertas, 'Alertas obtenidas exitosamente');
        } catch (error) {
            Logger.error('Error al obtener alertas:', error);
            return sendError(res, 'Error al obtener alertas', 500);
        }
    }

    /**
     * GET /api/hitos-solicitud/dashboard/:consultor_id
     * Dashboard de hitos para consultores
     * Si el usuario es admin, muestra todas las alertas de todos los consultores
     */
    static async getDashboard(req: Request, res: Response): Promise<Response> {
        try {
            const { consultor_id } = req.params;
            const isAdmin = req.user?.role === 'admin';
            
            // Si es admin o consultor_id es 'all', usar undefined para obtener todos los hitos
            const consultorIdFiltro = (isAdmin || consultor_id === 'all') ? undefined : consultor_id;
            
            // Obtener todos los datos del dashboard en paralelo
            const [
                hitosPorVencer,
                hitosVencidos,
                hitosPendientes,
                hitosCompletados,
                estadisticas
            ] = await Promise.all([
                HitoSolicitudService.getHitosPorVencer(consultorIdFiltro),
                HitoSolicitudService.getHitosVencidos(consultorIdFiltro),
                HitoSolicitudService.getHitosPendientes(consultorIdFiltro),
                HitoSolicitudService.getHitosCompletados(consultorIdFiltro),
                HitoSolicitudService.getEstadisticas()
            ]);

            // Si es admin, no filtrar (ya vienen filtrados del servicio)
            // Si es consultor, filtrar por consultor_id
            const hitosFiltrados = isAdmin ? {
                por_vencer: hitosPorVencer,
                vencidos: hitosVencidos,
                pendientes: hitosPendientes,
                completados: hitosCompletados
            } : {
                por_vencer: hitosPorVencer.filter(h => h.solicitud?.rut_usuario === consultor_id),
                vencidos: hitosVencidos.filter(h => h.solicitud?.rut_usuario === consultor_id),
                pendientes: hitosPendientes.filter(h => h.solicitud?.rut_usuario === consultor_id),
                completados: hitosCompletados.filter(h => h.solicitud?.rut_usuario === consultor_id)
            };

            // Calcular estadísticas del consultor
            const totalHitosConsultor = Object.values(hitosFiltrados).reduce((total, hitos) => total + hitos.length, 0);
            const hitosCompletadosConsultor = hitosFiltrados.completados.length;
            const porcentajeCompletados = totalHitosConsultor > 0 ? 
                Math.round((hitosCompletadosConsultor / totalHitosConsultor) * 100) : 0;

            const dashboard = {
                consultor_id,
                resumen: {
                    total: totalHitosConsultor,
                    completados: hitosCompletadosConsultor,
                    pendientes: hitosFiltrados.pendientes.length,
                    por_vencer: hitosFiltrados.por_vencer.length,
                    vencidos: hitosFiltrados.vencidos.length,
                    porcentaje_completados: porcentajeCompletados
                },
                hitos: hitosFiltrados,
                alertas_urgentes: [
                    ...hitosFiltrados.vencidos,
                    ...hitosFiltrados.por_vencer.filter(h => h.dias_restantes <= 1)
                ],
                timestamp: new Date().toISOString()
            };

            return sendSuccess(res, dashboard, 'Dashboard obtenido exitosamente');
        } catch (error) {
            Logger.error('Error al obtener dashboard:', error);
            return sendError(res, 'Error al obtener dashboard', 500);
        }
    }

    // ===========================================
    // ACCIONES
    // ===========================================

    /**
     * PUT /api/hitos-solicitud/:id/completar
     * Marcar hito como completado
     */
    static async completar(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const { fecha_cumplimiento } = req.body;
            
            const hito = await HitoSolicitudService.completarHito(
                parseInt(id),
                fecha_cumplimiento ? new Date(fecha_cumplimiento) : undefined
            );
            
            return sendSuccess(res, hito, 'Hito marcado como completado');
        } catch (error) {
            Logger.error('Error al completar hito:', error);
            return sendError(res, (error as Error).message || 'Error al completar hito', 500);
        }
    }

    // ===========================================
    // CRUD BÁSICO
    // ===========================================

    /**
     * GET /api/hitos-solicitud/:id
     * Obtener un hito específico
     */
    static async getById(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const hito = await HitoSolicitudService.getHitoById(parseInt(id));

            if (!hito) {
                return sendError(res, 'Hito no encontrado', 404);
            }

            return sendSuccess(res, hito, 'Hito obtenido exitosamente');
        } catch (error) {
            Logger.error('Error al obtener hito:', error);
            return sendError(res, 'Error al obtener hito', 500);
        }
    }

    /**
     * PUT /api/hitos-solicitud/:id
     * Actualizar hito
     */
    static async update(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const hito = await HitoSolicitudService.updateHito(parseInt(id), req.body, req.user?.id);
            return sendSuccess(res, hito, 'Hito actualizado exitosamente');
        } catch (error) {
            Logger.error('Error al actualizar hito:', error);
            return sendError(res, (error as Error).message || 'Error al actualizar hito', 500);
        }
    }

    /**
     * DELETE /api/hitos-solicitud/:id
     * Eliminar hito (solo plantillas)
     */
    static async delete(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            await HitoSolicitudService.deleteHito(parseInt(id), req.user?.id);
            return sendSuccess(res, null, 'Hito eliminado exitosamente');
        } catch (error) {
            Logger.error('Error al eliminar hito:', error);
            return sendError(res, (error as Error).message || 'Error al eliminar hito', 500);
        }
    }
}
