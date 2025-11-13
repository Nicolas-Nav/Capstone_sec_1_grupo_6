import { Transaction, Op } from 'sequelize';
import sequelize from '@/config/database';
import { setDatabaseUser } from '@/utils/databaseUser';
import { HitoSolicitud, Solicitud, DescripcionCargo, Contacto, Usuario, Cliente } from '@/models';
import { FechasLaborales } from '@/utils/fechasLaborales';
import { obtenerPlantillasPorServicio } from '@/data/plantillasHitos';

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
            order: [['codigo_servicio', 'ASC'], ['nombre_hito', 'ASC'], ['avisar_antes_dias', 'DESC']]
        });

        return plantillas;
    }

    /**
     * Crear plantilla de hito (para admin)
     */
    static async createPlantilla(data: {
        nombre_hito: string;
        tipo_ancla: string;
        duracion_dias: number;
        avisar_antes_dias: number;
        descripcion: string;
        codigo_servicio: string;
    }, usuarioRut?: string) {
        const transaction: Transaction = await sequelize.transaction();

        try {
            // Establecer el usuario en la sesión para los triggers de auditoría
            if (usuarioRut) {
                await setDatabaseUser(usuarioRut, transaction);
            }
            
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
    // GESTIÓN DE HITOS POR SOLICITUD
    // ===========================================

    /**
     * Copiar plantillas a una solicitud específica
     */
    static async copiarPlantillasASolicitud(idSolicitud: number, usuarioRut?: string) {
        const transaction: Transaction = await sequelize.transaction();

        try {
            // Establecer el usuario en la transacción para los triggers de auditoría
            if (usuarioRut) {
                await setDatabaseUser(usuarioRut, transaction);
            }

            // Obtener la solicitud para saber el tipo de servicio
            const solicitud = await Solicitud.findByPk(idSolicitud);
            if (!solicitud) {
                throw new Error('Solicitud no encontrada');
            }

            // Obtener plantillas del servicio
            const plantillas = obtenerPlantillasPorServicio(solicitud.codigo_servicio);

            if (plantillas.length === 0) {
                console.log(`No hay plantillas para el servicio ${solicitud.codigo_servicio}`);
                await transaction.commit();
                return [];
            }

            // Crear hitos basados en las plantillas
            const hitosCreados = [];
            for (const plantilla of plantillas) {
                const hito = await HitoSolicitud.create({
                    ...plantilla,
                    id_solicitud: idSolicitud,
                    fecha_base: undefined,
                    fecha_limite: undefined,
                    fecha_cumplimiento: undefined
                }, { transaction });
                hitosCreados.push(hito);
            }

            await transaction.commit();
            return hitosCreados;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Activar hitos por evento ancla
     */
    static async activarHitosPorEvento(idSolicitud: number, tipoAncla: string, fechaEvento: Date, usuarioRut?: string) {
        const transaction: Transaction = await sequelize.transaction();

        try {
            // Establecer el usuario en la transacción para los triggers de auditoría
            if (usuarioRut) {
                await setDatabaseUser(usuarioRut, transaction);
            }

            // Buscar hitos pendientes con el tipo de ancla específico
            const hitosPendientes = await HitoSolicitud.findAll({
                where: {
                    id_solicitud: idSolicitud,
                    tipo_ancla: tipoAncla,
                    fecha_base: { [Op.is]: null } as any
                },
                transaction
            });

            // Activar cada hito
            for (const hito of hitosPendientes) {
                const fechaLimite = await FechasLaborales.sumarDiasHabiles(fechaEvento, hito.duracion_dias);

                await hito.update({
                    fecha_base: fechaEvento,
                    fecha_limite: fechaLimite
                }, { transaction });
            }

            await transaction.commit();
            return hitosPendientes;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Obtener hitos de una solicitud específica
     */
    static async getHitosBySolicitud(idSolicitud: number) {
        const hitos = await HitoSolicitud.findAll({
            where: { id_solicitud: idSolicitud },
            order: [['fecha_limite', 'ASC']]
        });

        return hitos.map(h => ({
            ...h.toJSON(),
            dias_restantes: h.diasHabilesRestantes(),
            debe_avisar: h.debeAvisar()
        }));
    }

    // ===========================================
    // CONSULTAS DASHBOARD
    // ===========================================

    /**
     * Obtener hitos VENCIDOS (atrasados)
     */
    static async getHitosVencidos(consultor_id?: string) {
        const where: any = {
                id_solicitud: { [Op.not]: null } as any,
                fecha_limite: { [Op.lt]: new Date() },
                fecha_cumplimiento: { [Op.is]: null } as any
        };

        const hitos = await HitoSolicitud.findAll({
            where,
            include: [
                {
                model: Solicitud,
                as: 'solicitud',
                    required: true,
                    include: [
                        { model: DescripcionCargo, as: 'descripcionCargo' },
                        { 
                            model: Contacto, 
                            as: 'contacto',
                            include: [
                                { model: Cliente, as: 'cliente' }
                            ]
                        },
                        { model: Usuario, as: 'usuario', required: true }
                    ]
                }
            ],
            order: [['fecha_limite', 'ASC']]
        });

        // Filtrar por consultor si se especifica
        let hitosFiltrados = hitos;
        if (consultor_id) {
            console.log(`🔍 [DEBUG] Filtrando hitos VENCIDOS para consultor_id: ${consultor_id}`);
            console.log(`🔍 [DEBUG] Total hitos encontrados: ${hitos.length}`);
            
            hitosFiltrados = hitos.filter(h => {
                const hitoData = h.toJSON() as any;
                const rutUsuario = hitoData.solicitud?.rut_usuario;
                const matches = rutUsuario === consultor_id;
                
                console.log(`🔍 [DEBUG] Hito ${hitoData.id_hito_solicitud}: rut_usuario=${rutUsuario}, matches=${matches}`);
                
                return matches;
            });
            
            console.log(`🔍 [DEBUG] Hitos vencidos filtrados: ${hitosFiltrados.length}`);
        }

        return hitosFiltrados.map(h => {
            const hitoData = h.toJSON() as any;
            return {
                ...hitoData,
            estado: 'vencido',
                dias_atrasados: Math.abs(h.diasHabilesRestantes() || 0),
                descripcion: h.getMensajeAlerta(), // Usar mensaje dinámico
                solicitud: hitoData.solicitud ? {
                    ...hitoData.solicitud,
                    descripcionCargo: hitoData.solicitud.descripcionCargo,
                    contacto: hitoData.solicitud.contacto,
                    usuario: hitoData.solicitud.usuario
                } : null
            };
        });
    }

    /**
     * Obtener hitos POR VENCER (en período de aviso)
     */
    static async getHitosPorVencer(consultor_id?: string) {
        const ahora = new Date();
        
        const hitos = await HitoSolicitud.findAll({
            where: {
                id_solicitud: { [Op.not]: null } as any,
                fecha_limite: { [Op.gte]: ahora },
                fecha_cumplimiento: { [Op.is]: null } as any
            },
            include: [
                {
                model: Solicitud,
                as: 'solicitud',
                    required: true,
                    include: [
                        { model: DescripcionCargo, as: 'descripcionCargo' },
                        { 
                            model: Contacto, 
                            as: 'contacto',
                            include: [
                                { model: Cliente, as: 'cliente' }
                            ]
                        },
                        { model: Usuario, as: 'usuario', required: true }
                    ]
                }
            ],
            order: [['fecha_limite', 'ASC']]
        });

        // Filtrar por consultor si se especifica
        let hitosFiltrados = hitos;
        if (consultor_id) {
            console.log(`🔍 [DEBUG] Filtrando hitos POR VENCER para consultor_id: ${consultor_id}`);
            console.log(`🔍 [DEBUG] Total hitos encontrados: ${hitos.length}`);
            
            hitosFiltrados = hitos.filter(h => {
                const hitoData = h.toJSON() as any;
                const rutUsuario = hitoData.solicitud?.rut_usuario;
                const matches = rutUsuario === consultor_id;
                
                console.log(`🔍 [DEBUG] Hito ${hitoData.id_hito_solicitud}: rut_usuario=${rutUsuario}, matches=${matches}`);

                return matches;
            });
            
            console.log(`🔍 [DEBUG] Hitos por vencer filtrados: ${hitosFiltrados.length}`);
        }

        return hitosFiltrados.map(h => {
            const hitoData = h.toJSON() as any;
            const diasRestantes = h.diasHabilesRestantes();
            const debeAvisar = h.debeAvisar();
            
            return {
                ...hitoData,
                estado: diasRestantes && diasRestantes < 0 ? 'vencido' : 'por_vencer',
                dias_restantes: diasRestantes,
                debe_avisar: debeAvisar,
                descripcion: h.getMensajeAlerta(), // Usar mensaje dinámico
                solicitud: hitoData.solicitud ? {
                    ...hitoData.solicitud,
                    descripcionCargo: hitoData.solicitud.descripcionCargo,
                    contacto: hitoData.solicitud.contacto,
                    usuario: hitoData.solicitud.usuario
                } : null
            };
        });
    }

    /**
     * Obtener hitos PENDIENTES (no activados aún)
     */
    static async getHitosPendientes(consultor_id?: string) {
        const where: any = {
            id_solicitud: { [Op.not]: null } as any,
            fecha_base: { [Op.is]: null } as any
        };

        const hitos = await HitoSolicitud.findAll({
            where,
            include: [
                {
                model: Solicitud,
                as: 'solicitud',
                    include: [
                        { model: DescripcionCargo, as: 'descripcionCargo' },
                        { 
                            model: Contacto, 
                            as: 'contacto',
                            include: [
                                { model: Cliente, as: 'cliente' }
                            ]
                        },
                        { model: Usuario, as: 'usuario', required: true }
                    ]
                }
            ],
            order: [['nombre_hito', 'ASC']]
        });

        // Filtrar por consultor si se especifica
        let hitosFiltrados = hitos;
        if (consultor_id) {
            hitosFiltrados = hitos.filter(h => {
                const hitoData = h.toJSON() as any;
                return hitoData.solicitud?.rut_usuario === consultor_id;
            });
        }

        return hitosFiltrados.map(h => {
            const hitoData = h.toJSON() as any;
            return {
                ...hitoData,
                estado: 'pendiente',
                dias_restantes: null,
                debe_avisar: false,
                solicitud: hitoData.solicitud
            };
        });
    }

    /**
     * Obtener hitos COMPLETADOS
     */
    static async getHitosCompletados(consultor_id?: string) {
        const where: any = {
            id_solicitud: { [Op.not]: null } as any,
            fecha_cumplimiento: { [Op.not]: null } as any
        };

        const hitos = await HitoSolicitud.findAll({
            where,
            include: [
                {
                model: Solicitud,
                as: 'solicitud',
                    include: [
                        { model: DescripcionCargo, as: 'descripcionCargo' },
                        { 
                            model: Contacto, 
                            as: 'contacto',
                            include: [
                                { model: Cliente, as: 'cliente' }
                            ]
                        },
                        { model: Usuario, as: 'usuario', required: true }
                    ]
                }
            ],
            order: [['fecha_cumplimiento', 'DESC']]
        });

        // Filtrar por consultor si se especifica
        let hitosFiltrados = hitos;
        if (consultor_id) {
            hitosFiltrados = hitos.filter(h => {
                const hitoData = h.toJSON() as any;
                return hitoData.solicitud?.rut_usuario === consultor_id;
            });
        }

        return hitosFiltrados.map(h => {
            const hitoData = h.toJSON() as any;
            return {
                ...hitoData,
                estado: 'completado',
                dias_restantes: 0,
                debe_avisar: false,
                solicitud: hitoData.solicitud
            };
        });
    }

    /**
     * Estadísticas de hitos para dashboard
     */
    static async getEstadisticas() {
        const totalHitos = await HitoSolicitud.count({ 
            where: { id_solicitud: { [Op.not]: null } } as any
        });

        const hitosCompletados = await HitoSolicitud.count({
            where: {
                id_solicitud: { [Op.not]: null } as any,
                fecha_cumplimiento: { [Op.not]: null } as any
            }
        });

        const hitosVencidos = await HitoSolicitud.count({
            where: {
                id_solicitud: { [Op.not]: null } as any,
                fecha_limite: { [Op.lt]: new Date() },
                fecha_cumplimiento: { [Op.is]: null } as any
            }
        });

        const hitosPorVencer = await HitoSolicitud.count({
            where: {
                id_solicitud: { [Op.not]: null } as any,
                fecha_limite: { [Op.gte]: new Date() },
                fecha_cumplimiento: { [Op.is]: null } as any
            }
        });

        const totalHitosNum = totalHitos as number;
        const hitosCompletadosNum = hitosCompletados as number;
        const hitosVencidosNum = hitosVencidos as number;
        const hitosPorVencerNum = hitosPorVencer as number;

        return {
            total: totalHitosNum,
            completados: hitosCompletadosNum,
            vencidos: hitosVencidosNum,
            por_vencer: hitosPorVencerNum,
            pendientes: totalHitosNum - hitosCompletadosNum - hitosVencidosNum - hitosPorVencerNum,
            porcentaje_completados: totalHitosNum > 0 ? Math.round((hitosCompletadosNum / totalHitosNum) * 100) : 0
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
     * Obtener un hito específico
     */
    static async getHitoById(id: number) {
        const hito = await HitoSolicitud.findByPk(id);
        if (!hito) {
            throw new Error('Hito no encontrado');
        }

        return {
            ...hito.toJSON(),
            dias_restantes: hito.diasHabilesRestantes(),
            debe_avisar: hito.debeAvisar()
        };
    }

    /**
     * Actualizar hito
     */
    static async updateHito(id: number, data: Partial<{
        nombre_hito: string;
        tipo_ancla: string;
        duracion_dias: number;
        avisar_antes_dias: number;
        descripcion: string;
        codigo_servicio: string;
        fecha_base: Date;
        fecha_limite: Date;
        fecha_cumplimiento: Date;
    }>, usuarioRut?: string) {
        const transaction: Transaction = await sequelize.transaction();

        try {
            // Establecer el usuario en la sesión para los triggers de auditoría
            if (usuarioRut) {
                await setDatabaseUser(usuarioRut, transaction);
            }
            
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
     * Eliminar hito (solo plantillas)
     */
    static async deleteHito(id: number, usuarioRut?: string) {
        const transaction: Transaction = await sequelize.transaction();

        try {
            // Establecer el usuario en la sesión para los triggers de auditoría
            if (usuarioRut) {
                await setDatabaseUser(usuarioRut, transaction);
            }
            
            const hito = await HitoSolicitud.findByPk(id);
            if (!hito) {
                throw new Error('Hito no encontrado');
            }

            if (!hito.esPlantilla()) {
                throw new Error('Solo se pueden eliminar plantillas');
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
