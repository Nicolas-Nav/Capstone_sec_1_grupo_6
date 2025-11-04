import { Transaction } from 'sequelize';
import sequelize from '@/config/database';
import EstadoCliente from '@/models/EstadoCliente';
import EstadoClientePostulacion from '@/models/EstadoClientePostulacion';
import EstadoCandidato from '@/models/EstadoCandidato';
import Postulacion from '@/models/Postulacion';

export class EstadoClienteService {
    /**
     * Obtener todos los estados de cliente
     */
    static async getAll() {
        const estados = await EstadoCliente.findAll({
            order: [['id_estado_cliente', 'ASC']]
        });

        return estados.map(estado => ({
            id_estado_cliente: estado.id_estado_cliente,
            nombre_estado: estado.nombre_estado,
            ...estado.getInfoInterfaz()
        }));
    }

    /**
     * Cambiar estado de cliente para una postulación
     */
    static async cambiarEstado(
        id_postulacion: number, 
        data: {
            id_estado_cliente: number;
            comentarios?: string;
            fecha_presentacion?: string;
            fecha_feedback_cliente?: string;
        }
    ) {
        const transaction: Transaction = await sequelize.transaction();

        try {
            const { id_estado_cliente, comentarios, fecha_presentacion, fecha_feedback_cliente } = data;

            // Verificar que la postulación existe
            const postulacion = await Postulacion.findByPk(id_postulacion);
            if (!postulacion) {
                throw new Error('Postulación no encontrada');
            }

            // Verificar que el estado de cliente existe
            const estadoCliente = await EstadoCliente.findByPk(id_estado_cliente);
            if (!estadoCliente) {
                throw new Error('Estado de cliente no encontrado');
            }

            // Validar que se pueden hacer comentarios si es necesario
            if (estadoCliente.requiereComentarios() && (!comentarios || comentarios.trim() === '')) {
                throw new Error(`Los comentarios son obligatorios para el estado "${estadoCliente.nombre_estado}"`);
            }

            // Buscar si ya existe un registro con este estado para esta postulación
            const registroExistente = await EstadoClientePostulacion.findOne({
                where: {
                    id_estado_cliente,
                    id_postulacion
                },
                transaction
            });

            // Preparar datos para fecha_feedback_cliente_m3 (convertir string a Date solo si se proporciona)
            let fechaFeedbackDate: Date | undefined = undefined;
            if (fecha_feedback_cliente && typeof fecha_feedback_cliente === 'string' && fecha_feedback_cliente.trim() !== '') {
                fechaFeedbackDate = new Date(fecha_feedback_cliente);
            }

            // Preparar datos para comentario_rech_obs_cliente
            const comentarioRechObs = comentarios && comentarios.trim() !== '' ? comentarios.trim() : undefined;

            if (registroExistente) {
                // El registro existe con el mismo estado → UPDATE (solo actualizar fecha/comentario si se proporcionan)
                const updateData: any = {};

                if (fechaFeedbackDate !== undefined) {
                    updateData.fecha_feedback_cliente_m3 = fechaFeedbackDate;
                }

                if (comentarioRechObs !== undefined) {
                    updateData.comentario_rech_obs_cliente = comentarioRechObs;
                }

                // Actualizar updated_at manualmente
                updateData.updated_at = new Date();

                if (Object.keys(updateData).length > 0) {
                    await registroExistente.update(updateData, { transaction });
                }
            } else {
                // El registro NO existe → CREATE nuevo registro (el estado cambió o es el primero)
                // La columna updated_at se establece automáticamente por el DEFAULT en la BD
                await EstadoClientePostulacion.create({
                    id_postulacion,
                    id_estado_cliente,
                    fecha_feedback_cliente_m3: fechaFeedbackDate,
                    comentario_rech_obs_cliente: comentarioRechObs
                }, { transaction });
            }

            // Actualizar fecha_envio en postulacion si se proporciona fecha_presentacion
            if (fecha_presentacion) {
                await postulacion.update({
                    fecha_envio: new Date(fecha_presentacion)
                }, { transaction });
            }

            // Sincronizar EstadoCandidato si el estado del cliente es "Aprobado"
            if (estadoCliente.nombre_estado.toLowerCase() === 'aprobado') {
                // Buscar el estado "aprobado" en EstadoCandidato
                const estadoCandidatoAprobado = await EstadoCandidato.findOne({
                    where: { nombre_estado_candidato: 'aprobado' }
                });

                if (estadoCandidatoAprobado) {
                    // Actualizar el id_estado_candidato en la postulación
                    await postulacion.update({
                        id_estado_candidato: estadoCandidatoAprobado.id_estado_candidato
                    }, { transaction });
                }
            }

            await transaction.commit();

            return {
                id_postulacion,
                id_estado_cliente,
                nombre_estado: estadoCliente.nombre_estado,
                comentarios: comentarios || null,
                fecha_presentacion: fecha_presentacion || null,
                fecha_feedback_cliente: fecha_feedback_cliente || null,
                ...estadoCliente.getInfoInterfaz()
            };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Obtener historial de cambios de estado para una postulación
     */
    static async getHistorial(id_postulacion: number) {
        const historial = await EstadoClientePostulacion.findAll({
            where: { id_postulacion },
            include: [
                {
                    model: EstadoCliente,
                    as: 'estadoCliente',
                    attributes: ['id_estado_cliente', 'nombre_estado']
                }
            ],
            order: [['id_estado_cliente', 'ASC']]
        });

        return historial.map(registro => ({
            id_postulacion: registro.id_postulacion,
            id_estado_cliente: registro.id_estado_cliente,
            nombre_estado: (registro as any).estadoCliente?.nombre_estado,
            fecha_feedback_cliente_m3: registro.fecha_feedback_cliente_m3 || null,
            comentario_rech_obs_cliente: registro.comentario_rech_obs_cliente || null
        }));
    }

    /**
     * Obtener el estado actual de una postulación
     * Retorna el estado que tenga fecha_feedback_cliente_m3 más reciente, o cualquier estado si no hay fechas
     */
    static async getEstadoActual(id_postulacion: number) {
        const todosLosEstados = await EstadoClientePostulacion.findAll({
            where: { id_postulacion },
            include: [
                {
                    model: EstadoCliente,
                    as: 'estadoCliente',
                    attributes: ['id_estado_cliente', 'nombre_estado']
                }
            ]
        });

        if (!todosLosEstados || todosLosEstados.length === 0) {
            return null;
        }

        // Buscar el estado con fecha_feedback_cliente_m3 más reciente
        const estadoConFecha = todosLosEstados
            .filter(e => e.fecha_feedback_cliente_m3 !== null && e.fecha_feedback_cliente_m3 !== undefined)
            .sort((a, b) => {
                const fechaA = a.fecha_feedback_cliente_m3?.getTime() || 0;
                const fechaB = b.fecha_feedback_cliente_m3?.getTime() || 0;
                return fechaB - fechaA; // Más reciente primero
            })[0];

        // Si hay uno con fecha, retornarlo; si no, retornar el primero
        const ultimoEstado = estadoConFecha || todosLosEstados[0];

        return {
            id_postulacion: ultimoEstado.id_postulacion,
            id_estado_cliente: ultimoEstado.id_estado_cliente,
            nombre_estado: (ultimoEstado as any).estadoCliente?.nombre_estado,
            fecha_feedback_cliente_m3: ultimoEstado.fecha_feedback_cliente_m3 || null,
            comentario_rech_obs_cliente: ultimoEstado.comentario_rech_obs_cliente || null
        };
    }
}
