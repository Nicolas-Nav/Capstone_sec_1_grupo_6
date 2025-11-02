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

            // Verificar si el estado realmente cambió
            // Obtener el último estado de cliente para esta postulación
            const ultimoEstadoCliente = await EstadoClientePostulacion.findOne({
                where: { id_postulacion },
                order: [['fecha_cambio_estado_cliente', 'DESC']]
            });

            console.log('[DEBUG] Estado actual:', {
                id_postulacion,
                id_estado_cliente_solicitado: id_estado_cliente,
                ultimoEstadoCliente_id: ultimoEstadoCliente?.id_estado_cliente,
                ultimoEstadoCliente_fecha: ultimoEstadoCliente?.fecha_cambio_estado_cliente,
                estadoCambio: !ultimoEstadoCliente || ultimoEstadoCliente.id_estado_cliente !== id_estado_cliente
            });

            // Solo crear registro en estado_cliente_postulacion si el estado cambió
            let fechaCambio: Date | null = null;
            if (!ultimoEstadoCliente || ultimoEstadoCliente.id_estado_cliente !== id_estado_cliente) {
                // El estado cambió o es el primer estado
                // Si el estado cambió, SIEMPRE crear un nuevo registro con fecha actual (timestamp preciso)
                // Esto asegura que el nuevo registro sea el más reciente, incluso si la fecha del frontend es antigua
                fechaCambio = new Date(); // Usar fecha/hora actual para garantizar que sea el más reciente
                
                console.log('[DEBUG] Estado cambió, creando nuevo registro con fecha actual:', {
                    id_postulacion,
                    id_estado_cliente,
                    fecha_cambio_estado_cliente: fechaCambio,
                    fecha_feedback_cliente_proporcionada: fecha_feedback_cliente
                });
                
                // Crear nuevo registro directamente (si el estado cambió, siempre creamos uno nuevo)
                const nuevoRegistro = await EstadoClientePostulacion.create({
                    id_postulacion,
                    id_estado_cliente,
                    fecha_cambio_estado_cliente: fechaCambio
                }, { transaction });
                
                console.log('[DEBUG] Nuevo registro creado:', {
                    id_estado: nuevoRegistro.id_estado_cliente,
                    fecha: nuevoRegistro.fecha_cambio_estado_cliente
                });
                
                fechaCambio = nuevoRegistro.fecha_cambio_estado_cliente;
            } else {
                // El estado no cambió, usar la fecha del último cambio
                fechaCambio = ultimoEstadoCliente.fecha_cambio_estado_cliente;
            }

            // Preparar datos para actualizar la postulación
            const updateData: any = {};

            // Actualizar comentarios si se proporcionan
            if (comentarios && comentarios.trim() !== '') {
                updateData.comentario_rech_obs_cliente = comentarios.trim();
            }

            // Actualizar fechas si se proporcionan
            if (fecha_presentacion) {
                updateData.fecha_envio = new Date(fecha_presentacion);
            }

            // Actualizar fecha de feedback del cliente si se proporciona (evitar string vacío, null, undefined)
            if (fecha_feedback_cliente && typeof fecha_feedback_cliente === 'string' && fecha_feedback_cliente.trim() !== '') {
                updateData.fecha_feedback_cliente = new Date(fecha_feedback_cliente);
            }

            // Actualizar la postulación con los nuevos datos
            if (Object.keys(updateData).length > 0) {
                await postulacion.update(updateData, { transaction });
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
                fecha_cambio_estado_cliente: fechaCambio,
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
            order: [['fecha_cambio_estado_cliente', 'DESC']]
        });

        return historial.map(registro => ({
            id_postulacion: registro.id_postulacion,
            id_estado_cliente: registro.id_estado_cliente,
            nombre_estado: (registro as any).estadoCliente?.nombre_estado,
            fecha_cambio_estado_cliente: registro.fecha_cambio_estado_cliente
        }));
    }

    /**
     * Obtener el estado actual de una postulación
     */
    static async getEstadoActual(id_postulacion: number) {
        const ultimoEstado = await EstadoClientePostulacion.findOne({
            where: { id_postulacion },
            include: [
                {
                    model: EstadoCliente,
                    as: 'estadoCliente',
                    attributes: ['id_estado_cliente', 'nombre_estado']
                }
            ],
            order: [['fecha_cambio_estado_cliente', 'DESC']]
        });

        if (!ultimoEstado) {
            return null;
        }

        return {
            id_postulacion: ultimoEstado.id_postulacion,
            id_estado_cliente: ultimoEstado.id_estado_cliente,
            nombre_estado: (ultimoEstado as any).estadoCliente?.nombre_estado,
            fecha_cambio_estado_cliente: ultimoEstado.fecha_cambio_estado_cliente
        };
    }
}
