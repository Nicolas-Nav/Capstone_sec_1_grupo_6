import { Transaction, Op, QueryTypes } from 'sequelize';
import sequelize from '@/config/database';
import EstadoClienteM5 from '@/models/EstadoClienteM5';
import EstadoClientePostulacionM5 from '@/models/EstadoClientePostulacionM5';
import Postulacion from '@/models/Postulacion';
import Contratacion from '@/models/Contratacion';
import EvaluacionPsicolaboral from '@/models/EvaluacionPsicolaboral';
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
            fecha_cambio_estado_cliente_m5: string | null; // Cambiado a string para evitar problemas de zona horaria
            comentario_modulo5_cliente?: string;
        }
    ) {
        const transaction: Transaction = await sequelize.transaction();

        try {
            const { id_estado_cliente_postulacion_m5, fecha_cambio_estado_cliente_m5, comentario_modulo5_cliente } = data;

            console.log(`[DEBUG] Cambiando estado módulo 5 - Postulación: ${id_postulacion}, Estado: ${id_estado_cliente_postulacion_m5}`);
            console.log(`[DEBUG] Fecha recibida: ${fecha_cambio_estado_cliente_m5}`);

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
                order: [['fecha_cambio_estado_cliente_m5', 'DESC'], ['id_estado_cliente_postulacion_m5', 'DESC']]
            });

            console.log(`[DEBUG] Último estado encontrado:`, ultimoEstado ? {
                id_estado: ultimoEstado.id_estado_cliente_postulacion_m5,
                fecha: ultimoEstado.fecha_cambio_estado_cliente_m5
            } : 'No existe');

            // Si el estado cambió, crear un nuevo registro
            const estadoCambio = !ultimoEstado || ultimoEstado.id_estado_cliente_postulacion_m5 !== id_estado_cliente_postulacion_m5;
            
            if (estadoCambio) {
                // IMPORTANTE: Cuando el ESTADO CAMBIA, siempre usar la fecha actual (hoy) para el nuevo estado
                // Esto garantiza que podamos determinar cuál es el estado más reciente
                // La fecha original se mantiene en los estados anteriores, pero el nuevo cambio debe tener fecha actual
                let fechaAUsar: string | null = null;
                
                if (fecha_cambio_estado_cliente_m5) {
                    // El usuario proporciona una fecha nueva, usarla
                    fechaAUsar = fecha_cambio_estado_cliente_m5;
                    console.log(`[DEBUG] Estado cambió. Usando fecha proporcionada por el usuario: ${fechaAUsar}`);
                } else {
                    // Cuando el estado cambia, SIEMPRE usar la fecha actual para poder ordenar correctamente
                    // Esto asegura que cada cambio de estado tenga una fecha única y más reciente
                    const ahora = new Date();
                    // Usar fecha y hora para mayor precisión, pero solo guardar la fecha (sin hora)
                    fechaAUsar = ahora.toISOString().split('T')[0];
                    console.log(`[DEBUG] Estado cambió. No se proporcionó fecha, usando fecha actual: ${fechaAUsar}`);
                }
                
                // Verificar si ya existe un registro con esta combinación estado+postulación
                const registroExistente = await EstadoClientePostulacionM5.findOne({
                    where: {
                        id_postulacion,
                        id_estado_cliente_postulacion_m5
                    }
                });

                if (!registroExistente) {
                    console.log(`[DEBUG] Creando nuevo registro de cambio de estado`);
                    console.log(`[DEBUG] Estado anterior: ${ultimoEstado?.id_estado_cliente_postulacion_m5 || 'Ninguno'}, Nuevo estado: ${id_estado_cliente_postulacion_m5}`);
                    console.log(`[DEBUG] Fecha a usar: ${fechaAUsar || 'NULL'}`);
                    
                    await EstadoClientePostulacionM5.create({
                        id_postulacion,
                        id_estado_cliente_postulacion_m5,
                        fecha_cambio_estado_cliente_m5: fechaAUsar ? new Date(fechaAUsar + 'T00:00:00') : new Date()
                    }, { transaction });
                } else {
                    console.log(`[DEBUG] Ya existe un registro con estado ${id_estado_cliente_postulacion_m5} para postulación ${id_postulacion}`);
                    // IMPORTANTE: Cuando el estado cambia, SIEMPRE actualizar la fecha al momento actual
                    // para que podamos determinar cuál es el estado más reciente
                    // Usar fecha/hora actual para garantizar unicidad, pero convertirlo a Date object
                    const fechaParaActualizar = fechaAUsar ? new Date(fechaAUsar + 'T00:00:00') : new Date();
                    console.log(`[DEBUG] Actualizando fecha del registro existente a: ${fechaParaActualizar.toISOString()}`);
                    await registroExistente.update({
                        fecha_cambio_estado_cliente_m5: fechaParaActualizar
                    }, { transaction });
                    console.log(`[DEBUG] Registro actualizado. Nueva fecha guardada: ${fechaParaActualizar.toISOString()}`);
                }
            } else {
                // El estado no cambió, pero puede que la fecha sí haya cambiado
                if (fecha_cambio_estado_cliente_m5 && ultimoEstado) {
                    const fechaActualStr = ultimoEstado.fecha_cambio_estado_cliente_m5?.toISOString().split('T')[0];
                    if (fechaActualStr !== fecha_cambio_estado_cliente_m5) {
                        console.log(`[DEBUG] Estado no cambió, pero actualizando fecha de ${fechaActualStr} a ${fecha_cambio_estado_cliente_m5}`);
                        await ultimoEstado.update({
                            fecha_cambio_estado_cliente_m5: fecha_cambio_estado_cliente_m5 as any
                        }, { transaction });
                    }
                }
            }

            // Actualizar comentario del módulo 5 en la postulación (siempre que haya comentario)
            if (comentario_modulo5_cliente !== undefined) {
                const comentarioValue = comentario_modulo5_cliente?.trim() ? comentario_modulo5_cliente : undefined;
                await postulacion.update({
                    comentario_modulo5_cliente: comentarioValue
                }, { transaction });
                console.log(`[DEBUG] Comentario actualizado: "${comentario_modulo5_cliente}"`);
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
            fecha_cambio_estado_cliente_m5: null, // Fecha NULL, se ingresa manualmente después
            comentario_modulo5_cliente: comentario || undefined
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

        // Obtener TODOS los estados de cada postulación (necesitamos todos para determinar el más reciente)
        const candidatosConEstadoM5 = await EstadoClientePostulacionM5.findAll({
            where: {
                id_postulacion: idsPostulaciones
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
            order: [
                ['id_postulacion', 'ASC'],
                ['fecha_cambio_estado_cliente_m5', 'DESC'],
                ['id_estado_cliente_postulacion_m5', 'DESC']
            ]
        });

        Logger.info(`[DEBUG] Encontrados ${candidatosConEstadoM5.length} registros en estado_cliente_postulacion_m5`);

        // Procesar cada registro (ya debería ser único por postulación)
        const candidatosUnicos = new Map();
        
        // Obtener información de contratación para postulaciones que tienen registro
        const contrataciones = await Contratacion.findAll({
            where: { id_postulacion: idsPostulaciones }
        });
        
        const contratacionMap = new Map(
            contrataciones.map(c => [c.id_postulacion, c])
        );
        
        // Obtener evaluaciones psicolaborales para incluir estado del informe
        const evaluaciones = await EvaluacionPsicolaboral.findAll({
            where: { id_postulacion: idsPostulaciones }
        });
        
        const evaluacionMap = new Map(
            evaluaciones.map(e => [e.id_postulacion, e])
        );
        
        // Obtener historial completo de estados para calcular fecha de feedback
        const historiales = await EstadoClientePostulacionM5.findAll({
            where: { id_postulacion: idsPostulaciones },
            order: [['fecha_cambio_estado_cliente_m5', 'ASC']]
        });

        // Agrupar historial por postulación
        const historialPorPostulacion = new Map<number, any[]>();
        historiales.forEach(estado => {
            if (!historialPorPostulacion.has(estado.id_postulacion)) {
                historialPorPostulacion.set(estado.id_postulacion, []);
            }
            historialPorPostulacion.get(estado.id_postulacion)!.push(estado);
        });

        // Agrupar por id_postulacion y tomar solo el más reciente
        // Primero, agrupar todos los estados por postulación
        const estadosPorPostulacion = new Map<number, any[]>();
        candidatosConEstadoM5.forEach((estado: any) => {
            if (!estadosPorPostulacion.has(estado.id_postulacion)) {
                estadosPorPostulacion.set(estado.id_postulacion, []);
            }
            estadosPorPostulacion.get(estado.id_postulacion)!.push(estado);
        });
        
        // Para cada postulación, encontrar el estado más reciente
        estadosPorPostulacion.forEach((estados: any[], idPostulacion: number) => {
            // Ordenar por fecha descendente (más reciente primero)
            // Si las fechas son iguales, el último insertado debería tener fecha actual
            const estadoMasReciente = estados.sort((a: any, b: any) => {
                const fechaA = a.fecha_cambio_estado_cliente_m5;
                const fechaB = b.fecha_cambio_estado_cliente_m5;
                
                // Si ambos tienen fecha, comparar fechas (más reciente primero)
                if (fechaA && fechaB) {
                    const diffFecha = fechaB.getTime() - fechaA.getTime();
                    if (diffFecha !== 0) return diffFecha;
                    // Si las fechas son iguales, necesitamos otro criterio
                    // En este caso, usamos el ID del estado como desempate
                    // pero esto NO es ideal - deberíamos tener un timestamp de creación
                    Logger.warn(`[DEBUG] Postulación ${idPostulacion}: Dos estados con la misma fecha. Estado A: ${(a as any).estadoClienteM5?.nombre_estado} (ID: ${a.id_estado_cliente_postulacion_m5}), Estado B: ${(b as any).estadoClienteM5?.nombre_estado} (ID: ${b.id_estado_cliente_postulacion_m5})`);
                }
                
                // Si uno tiene fecha y el otro no, el que tiene fecha es más reciente
                if (fechaA && !fechaB) return -1;
                if (!fechaA && fechaB) return 1;
                
                // Si ambos no tienen fecha (no debería pasar ahora), usar ID del estado
                const idA = a.id_estado_cliente_postulacion_m5 || 0;
                const idB = b.id_estado_cliente_postulacion_m5 || 0;
                return idB - idA;
            })[0]; // Tomar el primero después de ordenar
            
            Logger.info(`[DEBUG] Postulación ${idPostulacion}: Estado más reciente encontrado: ${(estadoMasReciente as any).estadoClienteM5?.nombre_estado}, Fecha: ${estadoMasReciente.fecha_cambio_estado_cliente_m5}, ID Estado: ${estadoMasReciente.id_estado_cliente_postulacion_m5}`);
            Logger.info(`[DEBUG] Postulación ${idPostulacion}: Todos los estados disponibles:`, estados.map((e: any) => ({
                estado: (e as any).estadoClienteM5?.nombre_estado,
                fecha: e.fecha_cambio_estado_cliente_m5,
                id_estado: e.id_estado_cliente_postulacion_m5
            })));
            candidatosUnicos.set(idPostulacion, estadoMasReciente);
        });

        const resultado = Array.from(candidatosUnicos.values()).map(estado => {
            const estadoData = estado as any; // Type assertion para acceder a las relaciones
            
            // Obtener la primera fecha no-null del historial (la fecha de feedback original)
            const historial = historialPorPostulacion.get(estado.id_postulacion) || [];
            let fechaFeedback = null;
            
            // Buscar la primera fecha no-null en el historial
            const primerRegistroConFecha = historial.find(h => h.fecha_cambio_estado_cliente_m5 !== null);
            if (primerRegistroConFecha) {
                fechaFeedback = primerRegistroConFecha.fecha_cambio_estado_cliente_m5;
            }
            
            Logger.info(`[DEBUG] Procesando candidato postulación ${estado.id_postulacion}, estado: ${estadoData.estadoClienteM5?.nombre_estado}`);
            Logger.info(`[DEBUG] Fecha cambio estado M5:`, estado.fecha_cambio_estado_cliente_m5);
            Logger.info(`[DEBUG] Fecha feedback calculada:`, fechaFeedback);
            Logger.info(`[DEBUG] Fecha formateada:`, fechaFeedback ? fechaFeedback.toISOString().split('T')[0] : null);
            
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
                // Mapear estado del módulo 5 (SIEMPRE desde estado_cliente_m5, no desde Contratacion)
                hiring_status: this.mapEstadoToFrontend(estadoData.estadoClienteM5?.nombre_estado),
                // Estado final de contratación (si existe registro en Contratacion)
                contratacion_status: (() => {
                    const contratacion = contratacionMap.get(estadoData.id_postulacion);
                    if (contratacion) {
                        // id_estado_contratacion: 1 = Contratado, 2 = No contratado
                        return contratacion.id_estado_contratacion === 1 ? 'contratado' : 'no_contratado';
                    }
                    return null;
                })(),
                // Mapear fecha de respuesta del cliente (fecha de feedback real calculada)
                client_response_date: fechaFeedback ? 
                    fechaFeedback.toISOString().split('T')[0] : null,
                // Fecha de contrato desde la tabla Contratacion (solo si existe)
                contract_date: (() => {
                    const contratacion = contratacionMap.get(estadoData.id_postulacion);
                    return contratacion?.fecha_ingreso_contratacion ? 
                        contratacion.fecha_ingreso_contratacion.toISOString().split('T')[0] : null;
                })(),
                // Obtener comentarios: si hay contratación, usar las observaciones de contratación; si no, usar comentarios del módulo 5
                observations: contratacionMap.get(estadoData.id_postulacion)?.observaciones_contratacion || 
                    estadoData.postulacion?.comentario_modulo5_cliente || '',
                // Estado del informe desde la evaluación psicolaboral
                estado_informe: evaluacionMap.get(estadoData.id_postulacion)?.estado_informe || null
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
            'Rechazo carta oferta': 'rechazo_carta_oferta',
            'Contratado': 'contratado',
            'No contratado': 'no_contratado'
        };
        
        return estadosMap[nombreEstado] || 'en_espera_feedback';
    }

    /**
     * Actualizar información completa del candidato en módulo 5
     * Incluye estado, fecha de respuesta del cliente y comentarios
     * Si el estado es "contratado" o "no_contratado", crea registro en tabla Contratacion
     */
    static async actualizarCandidatoModulo5(
        id_postulacion: number,
        data: {
            hiring_status: string; // Estado de contratación del frontend
            client_response_date?: string; // Fecha de respuesta del cliente en formato YYYY-MM-DD
            observations?: string; // Comentarios/observaciones del módulo 5
            fecha_ingreso_contratacion?: string; // Fecha de ingreso del candidato (opcional)
            observaciones_contratacion?: string; // Observaciones específicas de contratación (opcional)
        }
    ) {
        const transaction: Transaction = await sequelize.transaction();
        try {
            Logger.info(`[DEBUG] actualizarCandidatoModulo5 - Postulación: ${id_postulacion}`);
            Logger.info(`[DEBUG] Datos recibidos:`, JSON.stringify(data, null, 2));
            
            // Los estados "contratado" y "no_contratado" NO están en estado_cliente_m5
            // Solo crean registros en la tabla Contratacion
            if (data.hiring_status === 'contratado' || data.hiring_status === 'no_contratado') {
                Logger.info(`[DEBUG] Estado final de contratación: ${data.hiring_status}`);
                Logger.info(`[DEBUG] Creando/actualizando registro de contratación para postulación ${id_postulacion}`);
                
                // Mapear estado de contratación: 1 = Contratado, 2 = No contratado
                const id_estado_contratacion = data.hiring_status === 'contratado' ? 1 : 2;
                
                // Verificar si ya existe un registro de contratación para esta postulación
                const contratacionExistente = await Contratacion.findOne({
                    where: { id_postulacion },
                    transaction
                });

                if (contratacionExistente) {
                    // Actualizar registro existente
                    Logger.info(`[DEBUG] Actualizando registro de contratación existente`);
                    await contratacionExistente.update({
                        fecha_ingreso_contratacion: data.fecha_ingreso_contratacion ? new Date(data.fecha_ingreso_contratacion) : undefined,
                        observaciones_contratacion: data.observaciones_contratacion || undefined,
                        id_estado_contratacion
                    }, { transaction });
                } else {
                    // Crear nuevo registro
                    Logger.info(`[DEBUG] Creando nuevo registro de contratación`);
                    const nuevoRegistro = await Contratacion.create({
                        id_postulacion,
                        fecha_ingreso_contratacion: data.fecha_ingreso_contratacion ? new Date(data.fecha_ingreso_contratacion) : undefined,
                        observaciones_contratacion: data.observaciones_contratacion || undefined,
                        encuesta_satisfaccion: undefined,
                        id_estado_contratacion
                    }, { transaction });
                    
                    Logger.info(`[DEBUG] Registro de contratación creado con ID: ${nuevoRegistro.id_contratacion}`);
                }
                
                await transaction.commit();
                return {
                    success: true,
                    message: `Candidato registrado como ${data.hiring_status === 'contratado' ? 'Contratado' : 'No Contratado'} exitosamente`
                };
            }
            
            // Para los demás estados (en_espera_feedback, no_seleccionado, etc.)
            // Mapear estados del frontend a IDs de la base de datos (módulo 5)
            const estadosMap: { [key: string]: number } = {
                'en_espera_feedback': 1,
                'no_seleccionado': 2,
                'envio_carta_oferta': 3,
                'aceptacion_carta_oferta': 4,
                'rechazo_carta_oferta': 5
            };

            const id_estado_cliente_postulacion_m5 = estadosMap[data.hiring_status];
            if (!id_estado_cliente_postulacion_m5) {
                throw new Error(`Estado de contratación no válido: ${data.hiring_status}. Estados válidos: ${Object.keys(estadosMap).join(', ')}, contratado, no_contratado`);
            }

            // IMPORTANTE: NO convertir la fecha a Date object para evitar problemas de zona horaria
            // Pasarla directamente como string en formato YYYY-MM-DD
            const fechaCambio = data.client_response_date || null;
            
            Logger.info(`[DEBUG] Estado mapeado: ${id_estado_cliente_postulacion_m5}, Fecha: ${fechaCambio}`);
            
            // Actualizar estado en módulo 5
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
