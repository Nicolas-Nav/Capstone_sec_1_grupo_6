import { Transaction, Op } from 'sequelize';
import sequelize from '@/config/database';
import { HitoSolicitud, Solicitud } from '@/models';

/**
 * Servicio para gestión de Hitos de Solicitud
 * Maneja plantillas y hitos activos por solicitud
 */

export class HitoSolicitudService {
    // ===========================================
    // GESTIÓN DE PLANTILLAS
    // ===========================================

    /**
     * Obtener todas las plantillas (hitos maestros)
     */
    static async getPlantillas(codigoServicio?: string) {
        const where: any = { id_solicitud: { [Op.is]: null } };
        if (codigoServicio) {
            where.codigo_servicio = codigoServicio;
        }

        const plantillas = await HitoSolicitud.findAll({
            where,
            order: [['codigo_servicio', 'ASC'], ['nombre_hito', 'ASC'], ['avisar_antes_horas', 'DESC']]
        });

        return plantillas;
    }

    /**
     * Crear plantilla de hito (para admin)
     */
    static async createPlantilla(data: {
        nombre_hito: string;
        tipo_ancla: string;
        duracion_horas: number;
        avisar_antes_horas: number;
        descripcion: string;
        codigo_servicio: string;
    }) {
        const transaction: Transaction = await sequelize.transaction();

        try {
            const plantilla = await HitoSolicitud.create({
                ...data,
                id_solicitud: undefined,
                fecha_base: undefined,
                fecha_limite: undefined,
                fecha_cumplimiento: undefined
            }, { transaction });

            await transaction.commit();
            return plantilla;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    // ===========================================
    // COPIAR PLANTILLAS A SOLICITUD
    // ===========================================

    /**
     * Copiar plantillas de hitos a una solicitud
     * Se ejecuta automáticamente cuando se crea una solicitud
     */
    static async copiarPlantillasASolicitud(idSolicitud: number) {
        const transaction: Transaction = await sequelize.transaction();

        try {
            // Obtener la solicitud CON su código de servicio
            const solicitud = await Solicitud.findByPk(idSolicitud);
            if (!solicitud) {
                throw new Error('Solicitud no encontrada');
            }

            // Obtener el código de servicio de la solicitud
            const codigoServicio = solicitud.codigo_servicio;
            if (!codigoServicio) {
                throw new Error('La solicitud no tiene código de servicio asignado');
            }

            // Buscar plantillas del código de servicio
            const plantillas = await HitoSolicitud.findAll({
                where: {
                    codigo_servicio: codigoServicio,
                    id_solicitud: { [Op.is]: null } as any
                }
            });

            if (plantillas.length === 0) {
                throw new Error(`No hay plantillas de hitos para el servicio ${codigoServicio}`);
            }

            // Copiar plantillas para esta solicitud
            const hitosCreados = [];
            for (const plantilla of plantillas) {
                const hitoNuevo = await HitoSolicitud.create({
                    nombre_hito: plantilla.nombre_hito,
                    tipo_ancla: plantilla.tipo_ancla,
                    duracion_horas: plantilla.duracion_horas,
                    avisar_antes_horas: plantilla.avisar_antes_horas,
                    descripcion: plantilla.descripcion,
                    codigo_servicio: plantilla.codigo_servicio,
                    id_solicitud: idSolicitud,
                    fecha_base: undefined,
                    fecha_limite: undefined,
                    fecha_cumplimiento: undefined
                }, { transaction });

                hitosCreados.push(hitoNuevo);
            }

            await transaction.commit();
            return hitosCreados;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    // ===========================================
    // ACTIVAR HITOS (ASIGNAR FECHAS)
    // ===========================================

    /**
     * Activar hitos cuando ocurre un evento ancla
     */
    static async activarHitosPorEvento(idSolicitud: number, tipoAncla: string, fechaEvento: Date) {
        const transaction: Transaction = await sequelize.transaction();

        try {
            // Buscar hitos de esta solicitud con este tipo de ancla
            const hitos = await HitoSolicitud.findAll({
                where: {
                    id_solicitud: idSolicitud,
                    tipo_ancla: tipoAncla,
                    fecha_base: { [Op.is]: null } as any // Solo los que no han sido activados
                }
            });

            if (hitos.length === 0) {
                throw new Error(`No hay hitos pendientes de tipo ${tipoAncla} para esta solicitud`);
            }

            // Actualizar fechas de cada hito
            const hitosActualizados = [];
            for (const hito of hitos) {
                const fechaBase = new Date(fechaEvento);
                const fechaLimite = new Date(fechaBase.getTime() + (hito.duracion_horas * 60 * 60 * 1000));

                await hito.update({
                    fecha_base: fechaBase,
                    fecha_limite: fechaLimite
                }, { transaction });

                hitosActualizados.push(hito);
            }

            await transaction.commit();
            return hitosActualizados;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    // ===========================================
    // CONSULTAS PARA DASHBOARD
    // ===========================================

    /**
     * Obtener hitos por solicitud
     */
    static async getHitosBySolicitud(idSolicitud: number) {
        const hitos = await HitoSolicitud.findAll({
            where: { id_solicitud: idSolicitud },
            order: [['fecha_limite', 'ASC'], ['avisar_antes_horas', 'DESC']]
        });

        return hitos.map(h => ({
            ...h.toJSON(),
            estado: h.getEstado(),
            horas_restantes: h.horasRestantes()
        }));
    }

    /**
     * Obtener hitos VENCIDOS (atrasados)
     */
    static async getHitosVencidos() {
        const hitos = await HitoSolicitud.findAll({
            where: {
                id_solicitud: { [Op.not]: null } as any,
                fecha_limite: { [Op.lt]: new Date() },
                fecha_cumplimiento: { [Op.is]: null } as any
            },
            include: [{
                model: Solicitud,
                as: 'solicitud',
                attributes: ['id_solicitud', 'codigo_servicio']
            }],
            order: [['fecha_limite', 'ASC']]
        });

        return hitos.map(h => ({
            ...h.toJSON(),
            estado: 'vencido',
            horas_atrasadas: Math.abs(h.horasRestantes() || 0)
        }));
    }

    /**
     * Obtener hitos POR VENCER (en período de aviso)
     */
    static async getHitosPorVencer() {
        const ahora = new Date();
        
        const hitos = await HitoSolicitud.findAll({
            where: {
                id_solicitud: { [Op.not]: null } as any,
                fecha_limite: { [Op.gte]: ahora },
                fecha_cumplimiento: { [Op.is]: null } as any
            },
            include: [{
                model: Solicitud,
                as: 'solicitud',
                attributes: ['id_solicitud', 'codigo_servicio']
            }],
            order: [['fecha_limite', 'ASC']]
        });

        // Filtrar solo los que deben avisar
        const hitosPorVencer = hitos.filter(h => h.debeAvisar());

        return hitosPorVencer.map(h => ({
            ...h.toJSON(),
            estado: 'por_vencer',
            horas_restantes: h.horasRestantes()
        }));
    }

    /**
     * Obtener hitos PENDIENTES (no activados aún)
     */
    static async getHitosPendientes(idSolicitud?: number) {
        const where: any = {
            id_solicitud: { [Op.not]: null } as any,
            fecha_base: { [Op.is]: null } as any
        };

        if (idSolicitud) {
            where.id_solicitud = idSolicitud;
        }

        const hitos = await HitoSolicitud.findAll({
            where,
            include: [{
                model: Solicitud,
                as: 'solicitud',
                attributes: ['id_solicitud', 'codigo_servicio']
            }],
            order: [['id_solicitud', 'ASC'], ['nombre_hito', 'ASC']]
        });

        return hitos.map(h => ({
            ...h.toJSON(),
            estado: 'pendiente'
        }));
    }

    /**
     * Obtener hitos COMPLETADOS
     */
    static async getHitosCompletados(idSolicitud?: number) {
        const where: any = {
            fecha_cumplimiento: { [Op.not]: null } as any
        };

        if (idSolicitud) {
            where.id_solicitud = idSolicitud;
        }

        const hitos = await HitoSolicitud.findAll({
            where,
            include: [{
                model: Solicitud,
                as: 'solicitud',
                attributes: ['id_solicitud', 'codigo_servicio']
            }],
            order: [['fecha_cumplimiento', 'DESC']]
        });

        return hitos.map(h => ({
            ...h.toJSON(),
            estado: 'completado'
        }));
    }

    /**
     * Estadísticas de hitos para dashboard
     */
    static async getEstadisticas() {
        const total = await HitoSolicitud.count({ where: { id_solicitud: { [Op.not]: null } } as any });
        const completados = await HitoSolicitud.count({ where: { fecha_cumplimiento: { [Op.not]: null } } as any });
        const vencidos = await HitoSolicitud.count({
            where: {
                id_solicitud: { [Op.not]: null } as any,
                fecha_limite: { [Op.lt]: new Date() },
                fecha_cumplimiento: { [Op.is]: null } as any
            } as any
        });
        const pendientes = await HitoSolicitud.count({
            where: {
                id_solicitud: { [Op.not]: null } as any,
                fecha_base: { [Op.is]: null } as any
            } as any
        });

        return {
            total,
            completados,
            vencidos,
            pendientes,
            activos: total - completados - pendientes
        };
    }

    // ===========================================
    // MARCAR HITO COMO COMPLETADO
    // ===========================================

    /**
     * Marcar hito como completado
     */
    static async completarHito(id: number, fechaCumplimiento?: Date) {
        const transaction: Transaction = await sequelize.transaction();

        try {
            const hito = await HitoSolicitud.findByPk(id);
            if (!hito) {
                throw new Error('Hito no encontrado');
            }

            if (hito.esPlantilla()) {
                throw new Error('No se puede completar una plantilla');
            }

            await hito.update({
                fecha_cumplimiento: fechaCumplimiento || new Date()
            }, { transaction });

            await transaction.commit();
            return hito;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    // ===========================================
    // CRUD BÁSICO
    // ===========================================

    /**
     * Obtener un hito por ID
     */
    static async getHitoById(id: number) {
        const hito = await HitoSolicitud.findByPk(id, {
            include: [{
                model: Solicitud,
                as: 'solicitud'
            }]
        });

        if (!hito) return null;

        return {
            ...hito.toJSON(),
            estado: hito.getEstado(),
            horas_restantes: hito.horasRestantes()
        };
    }

    /**
     * Actualizar un hito (solo plantillas o campos específicos)
     */
    static async updateHito(id: number, data: Partial<{
        nombre_hito: string;
        descripcion: string;
        duracion_horas: number;
        avisar_antes_horas: number;
    }>) {
        const transaction: Transaction = await sequelize.transaction();

        try {
            const hito = await HitoSolicitud.findByPk(id);
            if (!hito) {
                throw new Error('Hito no encontrado');
            }

            await hito.update(data, { transaction });

            await transaction.commit();
            return hito;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Eliminar un hito (solo plantillas)
     */
    static async deleteHito(id: number) {
        const transaction: Transaction = await sequelize.transaction();

        try {
            const hito = await HitoSolicitud.findByPk(id);
            if (!hito) {
                throw new Error('Hito no encontrado');
            }

            if (!hito.esPlantilla()) {
                throw new Error('No se pueden eliminar hitos de solicitudes, solo plantillas');
            }

            await hito.destroy({ transaction });

            await transaction.commit();
            return true;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
}
