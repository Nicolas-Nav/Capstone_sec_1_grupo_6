import { Transaction } from 'sequelize';
import sequelize from '@/config/database';
import EstadoClienteM5 from '@/models/EstadoClienteM5';
import EstadoClientePostulacionM5 from '@/models/EstadoClientePostulacionM5';
import Postulacion from '@/models/Postulacion';
import { Logger } from '@/utils/logger';

export default class EstadoClienteM5Service {
    
    /**
     * Obtener todos los estados del módulo 5
     */
    static async getAllEstados() {
        return await EstadoClienteM5.findAll({
            order: [['id_estado_cliente_postulacion_m5', 'ASC']]
        });
    }

    /**
     * Obtener estado por ID
     */
    static async getEstadoById(id: number) {
        return await EstadoClienteM5.findByPk(id);
    }

    /**
     * Cambiar estado de cliente para una postulación (Módulo 5)
     */
    static async cambiarEstado(
        id_postulacion: number, 
        data: {
            id_estado_cliente_postulacion_m5: number;
            fecha_cambio_estado_cliente_m5: Date;
            comentario_modulo5_cliente?: string;
        }
    ) {
        const transaction: Transaction = await sequelize.transaction();

        try {
            const { id_estado_cliente_postulacion_m5, fecha_cambio_estado_cliente_m5, comentario_modulo5_cliente } = data;

            console.log(`[DEBUG] Cambiando estado módulo 5 - Postulación: ${id_postulacion}, Estado: ${id_estado_cliente_postulacion_m5}`);

            // Verificar que la postulación existe
            const postulacion = await Postulacion.findByPk(id_postulacion);
            if (!postulacion) {
                throw new Error('Postulación no encontrada');
            }

            // Verificar que el estado existe
            const estadoCliente = await EstadoClienteM5.findByPk(id_estado_cliente_postulacion_m5);
            if (!estadoCliente) {
                console.log(`[ERROR] Estado de cliente ${id_estado_cliente_postulacion_m5} no encontrado`);
                throw new Error('Estado de cliente no encontrado');
            }

            console.log(`[DEBUG] Estado encontrado: ${estadoCliente.nombre_estado}`);

            // Verificar si requiere comentarios
            if (estadoCliente.requiereComentarios() && (!comentario_modulo5_cliente || comentario_modulo5_cliente.trim() === '')) {
                throw new Error(`Los comentarios son obligatorios para el estado "${estadoCliente.nombre_estado}"`);
            }

            // Verificar si el estado realmente cambió
            const ultimoEstado = await EstadoClientePostulacionM5.findOne({
                where: { id_postulacion },
                order: [['fecha_cambio_estado_cliente_m5', 'DESC']]
            });

            // Crear registro en estado_cliente_postulacion_m5
            if (!ultimoEstado || ultimoEstado.id_estado_cliente_postulacion_m5 !== id_estado_cliente_postulacion_m5) {
                console.log(`[DEBUG] Creando nuevo registro de estado - Estado anterior: ${ultimoEstado?.id_estado_cliente_postulacion_m5}, Nuevo estado: ${id_estado_cliente_postulacion_m5}`);
                
                const createData = {
                    id_postulacion,
                    id_estado_cliente_postulacion_m5,
                    fecha_cambio_estado_cliente_m5
                };
                
                console.log(`[DEBUG] Datos a crear:`, createData);
                await EstadoClientePostulacionM5.create(createData, { transaction });
                console.log(`[DEBUG] Registro creado exitosamente`);
            } else {
                console.log(`[DEBUG] El estado no cambió, no se crea nuevo registro`);
            }

            // Actualizar comentario del módulo 5 en la postulación
            if (comentario_modulo5_cliente) {
                await postulacion.update({
                    comentario_modulo5_cliente
                }, { transaction });
            }

            await transaction.commit();

            return {
                success: true,
                id_postulacion,
                id_estado_cliente_postulacion_m5,
                fecha_cambio_estado_cliente_m5,
                message: 'Estado de cliente actualizado exitosamente (Módulo 5)'
            };

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Avanzar candidato al módulo 5 (desde módulo 4)
     */
    static async avanzarAlModulo5(id_postulacion: number, comentario?: string) {
        // Estado "En espera de feedback" tiene ID 1 en la nueva tabla
        const estadoEsperaFeedback = 1;
        
        return await this.cambiarEstado(id_postulacion, {
            id_estado_cliente_postulacion_m5: estadoEsperaFeedback,
            fecha_cambio_estado_cliente_m5: new Date(),
            comentario_modulo5_cliente: comentario || "Candidato avanzado al módulo 5 - En espera de feedback del cliente"
        });
    }

    /**
     * Obtener historial de cambios de estado para una postulación
     */
    static async getHistorial(id_postulacion: number) {
        const historial = await EstadoClientePostulacionM5.findAll({
            where: { id_postulacion },
            include: [
                {
                    model: EstadoClienteM5,
                    as: 'estadoCliente'
                }
            ],
            order: [['fecha_cambio_estado_cliente_m5', 'DESC']]
        });

        return historial.map((item: any) => ({
            id_estado_cliente: item.id_estado_cliente_postulacion_m5,
            nombre_estado: item.estadoCliente?.nombre_estado,
            fecha_cambio_estado_cliente_m5: item.fecha_cambio_estado_cliente_m5
        }));
    }

    /**
     * Obtener el último estado de una postulación
     */
    static async getUltimoEstado(id_postulacion: number) {
        const ultimoEstado = await EstadoClientePostulacionM5.findOne({
            where: { id_postulacion },
            include: [
                {
                    model: EstadoClienteM5,
                    as: 'estadoCliente'
                }
            ],
            order: [['fecha_cambio_estado_cliente_m5', 'DESC']]
        });

        if (!ultimoEstado) {
            return null;
        }

        return {
            id_estado_cliente: ultimoEstado.id_estado_cliente_postulacion_m5,
            nombre_estado: (ultimoEstado as any).estadoCliente?.nombre_estado,
            fecha_cambio_estado_cliente_m5: ultimoEstado.fecha_cambio_estado_cliente_m5
        };
    }

    /**
     * Obtener candidatos que están en el módulo 5 (tienen al menos un estado en estado_cliente_postulacion_m5)
     */
    static async getCandidatosEnModulo5(id_proceso: number) {
        Logger.info(`[DEBUG] Buscando candidatos del módulo 5 para proceso: ${id_proceso}`);
        
        const candidatosConEstadoM5 = await EstadoClientePostulacionM5.findAll({
            include: [
                {
                    model: Postulacion,
                    as: 'postulacion',
                    where: { id_solicitud: id_proceso }, // Corregido: usar id_solicitud en lugar de id_proceso
                    include: [
                        {
                            model: require('@/models/Candidato').default,
                            as: 'candidato'
                        }
                    ]
                },
                {
                    model: EstadoClienteM5,
                    as: 'estadoClienteM5'
                }
            ],
            order: [['fecha_cambio_estado_cliente_m5', 'DESC']]
        });

        Logger.info(`[DEBUG] Encontrados ${candidatosConEstadoM5.length} registros en estado_cliente_postulacion_m5`);

        // Agrupar por postulación para obtener solo el último estado de cada candidato
        const candidatosUnicos = new Map();
        
        candidatosConEstadoM5.forEach(estado => {
            const idPostulacion = estado.id_postulacion;
            if (!candidatosUnicos.has(idPostulacion)) {
                const estadoData = estado as any; // Type assertion para acceder a las relaciones
                Logger.info(`[DEBUG] Procesando candidato postulación ${idPostulacion}, estado: ${estadoData.estadoClienteM5?.nombre_estado}`);
                Logger.info(`[DEBUG] Datos del candidato:`, JSON.stringify(estadoData.postulacion?.candidato, null, 2));
                
                const candidatoData = estadoData.postulacion?.candidato;
                const candidatoInfo = candidatoData ? {
                    // Campos originales de la base de datos
                    id_candidato: candidatoData.id_candidato,
                    rut_candidato: candidatoData.rut_candidato,
                    nombre_candidato: candidatoData.nombre_candidato,
                    primer_apellido_candidato: candidatoData.primer_apellido_candidato,
                    segundo_apellido_candidato: candidatoData.segundo_apellido_candidato,
                    telefono_candidato: candidatoData.telefono_candidato,
                    email_candidato: candidatoData.email_candidato,
                    edad_candidato: candidatoData.edad_candidato,
                    
                    // Campos mapeados para compatibilidad con el frontend
                    id: candidatoData.id_candidato,
                    name: `${candidatoData.nombre_candidato} ${candidatoData.primer_apellido_candidato} ${candidatoData.segundo_apellido_candidato || ''}`.trim(),
                    email: candidatoData.email_candidato,
                    phone: candidatoData.telefono_candidato,
                    age: candidatoData.edad_candidato,
                    rut: candidatoData.rut_candidato
                } : {};
                
                candidatosUnicos.set(idPostulacion, {
                    ...candidatoInfo,
                    id_postulacion: estado.id_postulacion,
                    ultimo_estado_m5: estadoData.estadoClienteM5?.nombre_estado,
                    fecha_ultimo_cambio_m5: estado.fecha_cambio_estado_cliente_m5
                });
            }
        });

        const resultado = Array.from(candidatosUnicos.values());
        Logger.info(`[DEBUG] Retornando ${resultado.length} candidatos únicos del módulo 5`);
        Logger.info(`[DEBUG] Datos finales:`, JSON.stringify(resultado, null, 2));
        
        return resultado;
    }
}
