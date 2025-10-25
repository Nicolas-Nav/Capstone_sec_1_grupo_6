import { Transaction, Op } from 'sequelize';
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
            fecha_cambio_estado_cliente_m5: Date | null;
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

            console.log(`[DEBUG] Último estado encontrado:`, ultimoEstado ? {
                id_estado: ultimoEstado.id_estado_cliente_postulacion_m5,
                fecha: ultimoEstado.fecha_cambio_estado_cliente_m5
            } : 'No existe');

            // Si no hay fecha, solo actualizar comentarios sin crear registro de estado
            if (!fecha_cambio_estado_cliente_m5) {
                console.log(`[DEBUG] No hay fecha proporcionada, solo se actualizarán los comentarios`);
            } else {
                // Verificar si ya existe exactamente el mismo registro
                const registroExistente = await EstadoClientePostulacionM5.findOne({
                    where: {
                        id_postulacion,
                        id_estado_cliente_postulacion_m5,
                        fecha_cambio_estado_cliente_m5
                    }
                });

                console.log(`[DEBUG] Registro exacto existente:`, registroExistente ? 'SÍ EXISTE' : 'No existe');

                if (registroExistente) {
                    console.log(`[DEBUG] El registro exacto ya existe, solo se actualizarán los comentarios`);
                } else {
                    console.log(`[DEBUG] Creando nuevo registro porque no existe exactamente igual`);
                    console.log(`[DEBUG] Nuevo estado: ${id_estado_cliente_postulacion_m5}, Nueva fecha: ${fecha_cambio_estado_cliente_m5}`);
                    
                    const createData = {
                        id_postulacion,
                        id_estado_cliente_postulacion_m5,
                        fecha_cambio_estado_cliente_m5
                    };
                    
                    console.log(`[DEBUG] Datos a crear:`, createData);
                    await EstadoClientePostulacionM5.create(createData, { transaction });
                    console.log(`[DEBUG] Registro creado exitosamente`);
                }
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
        
        // Primero obtener las postulaciones del proceso
        const postulaciones = await Postulacion.findAll({
            where: { id_solicitud: id_proceso },
            attributes: ['id_postulacion'],
            raw: true
        });

        const idsPostulaciones = postulaciones.map(p => p.id_postulacion);
        
        if (idsPostulaciones.length === 0) {
            Logger.info(`[DEBUG] No se encontraron postulaciones para el proceso ${id_proceso}`);
            return [];
        }

        // Obtener el último estado de cada postulación usando una subconsulta
        const candidatosConEstadoM5 = await EstadoClientePostulacionM5.findAll({
            where: {
                id_postulacion: idsPostulaciones,
                // Subconsulta para obtener solo el registro más reciente de cada postulación
                [Op.and]: sequelize.literal(`
                    (id_postulacion, fecha_cambio_estado_cliente_m5) IN (
                        SELECT id_postulacion, MAX(fecha_cambio_estado_cliente_m5)
                        FROM estado_cliente_postulacion_m5 
                        WHERE id_postulacion IN (${idsPostulaciones.join(',')})
                        GROUP BY id_postulacion
                    )
                `)
            },
            include: [
                {
                    model: Postulacion,
                    as: 'postulacion',
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
            order: [['id_postulacion', 'ASC']]
        });

        Logger.info(`[DEBUG] Encontrados ${candidatosConEstadoM5.length} registros en estado_cliente_postulacion_m5`);

        // Procesar cada registro (ya debería ser único por postulación)
        const resultado = candidatosConEstadoM5.map(estado => {
            const estadoData = estado as any; // Type assertion para acceder a las relaciones
            Logger.info(`[DEBUG] Procesando candidato postulación ${estado.id_postulacion}, estado: ${estadoData.estadoClienteM5?.nombre_estado}`);
            Logger.info(`[DEBUG] Fecha cambio estado M5:`, estado.fecha_cambio_estado_cliente_m5);
            Logger.info(`[DEBUG] Fecha formateada:`, estado.fecha_cambio_estado_cliente_m5 ? 
                estado.fecha_cambio_estado_cliente_m5.toISOString().split('T')[0] : null);
            
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
            
            return {
                ...candidatoInfo,
                id_postulacion: estado.id_postulacion,
                ultimo_estado_m5: estadoData.estadoClienteM5?.nombre_estado,
                fecha_ultimo_cambio_m5: estado.fecha_cambio_estado_cliente_m5,
                // Mapear estado para compatibilidad con frontend
                hiring_status: this.mapEstadoToFrontend(estadoData.estadoClienteM5?.nombre_estado),
                // Mapear fecha de respuesta del cliente (fecha manual ingresada por el usuario)
                client_response_date: estado.fecha_cambio_estado_cliente_m5 ? 
                    estado.fecha_cambio_estado_cliente_m5.toISOString().split('T')[0] : null,
                // Fecha de contrato (por ahora vacía, se puede agregar después si es necesario)
                contract_date: null,
                // Obtener comentarios de la postulación
                observations: estadoData.postulacion?.comentario_modulo5_cliente || ''
            };
        });
        
        Logger.info(`[DEBUG] Retornando ${resultado.length} candidatos únicos del módulo 5`);
        Logger.info(`[DEBUG] Datos finales:`, JSON.stringify(resultado, null, 2));
        
        return resultado;
    }

    /**
     * Mapear estado de la base de datos al formato del frontend
     */
    private static mapEstadoToFrontend(nombreEstado: string): string {
        const estadosMap: { [key: string]: string } = {
            'En espera de feedback': 'en_espera_feedback',
            'No seleccionado': 'no_seleccionado',
            'Envío de carta oferta': 'envio_carta_oferta',
            'Aceptación carta oferta': 'aceptacion_carta_oferta',
            'Rechazo carta oferta': 'rechazo_carta_oferta'
        };
        
        return estadosMap[nombreEstado] || 'en_espera_feedback';
    }

    /**
     * Actualizar información completa del candidato en módulo 5
     * Incluye estado, fecha de respuesta del cliente y comentarios
     */
    static async actualizarCandidatoModulo5(
        id_postulacion: number,
        data: {
            hiring_status: string; // Estado de contratación del frontend
            client_response_date?: string; // Fecha de respuesta del cliente
            observations?: string; // Comentarios/observaciones
        }
    ) {
        const transaction: Transaction = await sequelize.transaction();
        try {
            // Mapear estados del frontend a IDs de la base de datos
            const estadosMap: { [key: string]: number } = {
                'en_espera_feedback': 1,
                'no_seleccionado': 2,
                'envio_carta_oferta': 3,
                'aceptacion_carta_oferta': 4,
                'rechazo_carta_oferta': 5
            };

            const id_estado_cliente_postulacion_m5 = estadosMap[data.hiring_status];
            if (!id_estado_cliente_postulacion_m5) {
                throw new Error(`Estado de contratación no válido: ${data.hiring_status}`);
            }

            // Cambiar estado usando el método existente
            // Solo usar la fecha si el usuario la proporcionó, de lo contrario null
            const fechaCambio = data.client_response_date ? new Date(data.client_response_date) : null;
            
            await this.cambiarEstado(id_postulacion, {
                id_estado_cliente_postulacion_m5,
                fecha_cambio_estado_cliente_m5: fechaCambio,
                comentario_modulo5_cliente: data.observations
            });

            await transaction.commit();
            return {
                success: true,
                message: 'Candidato del módulo 5 actualizado exitosamente'
            };
        } catch (error) {
            await transaction.rollback();
            Logger.error('Error al actualizar candidato del módulo 5:', error);
            throw error;
        }
    }
}
