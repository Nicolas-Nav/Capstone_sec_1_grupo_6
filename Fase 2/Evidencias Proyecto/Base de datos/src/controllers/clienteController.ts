import { Request, Response } from 'express';
import { Transaction } from 'sequelize';
import sequelize from '@/config/database';
import { Cliente, Contacto, Comuna } from '@/models';
import { sendSuccess, sendError } from '@/utils/response';
import { Logger } from '@/utils/logger';

/**
 * Controlador para gestión de Clientes y sus Contactos
 * Mapeo Frontend → Backend:
 * - Client.name → Cliente.nombre_cliente
 * - Client.contacts[] → Contacto[]
 */
export class ClienteController {
    /**
     * GET /api/clientes
     * Obtener todos los clientes con sus contactos
     */
    static async getAll(req: Request, res: Response): Promise<Response> {
        try {
            const clientes = await Cliente.findAll({
                include: [
                    {
                        model: Contacto,
                        as: 'contactos',
                        include: [
                            {
                                model: Comuna,
                                as: 'ciudad',
                                attributes: ['id_ciudad', 'nombre_comuna']
                            }
                        ]
                    }
                ],
                order: [['nombre_cliente', 'ASC']]
            });

            // Transformar al formato del frontend
            const clientesTransformados = clientes.map(cliente => ({
                id: cliente.id_cliente.toString(),
                name: cliente.nombre_cliente,
                contacts: (cliente.get('contactos') as any[])?.map((contacto: any) => ({
                    id: contacto.id_contacto.toString(),
                    name: contacto.nombre_contacto,
                    email: contacto.email_contacto,
                    phone: contacto.telefono_contacto,
                    position: contacto.cargo_contacto,
                    city_id: contacto.ciudad?.id_ciudad || null,
                    city_name: contacto.ciudad?.nombre_comuna || '',
                    is_primary: false // TODO: Agregar campo contacto_principal al modelo
                })) || []
            }));

            sendSuccess(res, clientesTransformados, 'Clientes obtenidos exitosamente');
            return res;
        } catch (error) {
            Logger.error('Error al obtener clientes:', error);
            sendError(res, 'Error al obtener clientes', 500);
            return res;
        }
    }

    /**
     * GET /api/clientes/:id
     * Obtener un cliente específico con sus contactos
     */
    static async getById(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;

            const cliente = await Cliente.findByPk(id, {
                include: [
                    {
                        model: Contacto,
                        as: 'contactos',
                        include: [
                            {
                                model: Comuna,
                                as: 'ciudad',
                                attributes: ['id_ciudad', 'nombre_comuna']
                            }
                        ]
                    }
                ]
            });

            if (!cliente) {
                sendError(res, 'Cliente no encontrado', 404);
                return res;
            }

            const clienteTransformado = {
                id: cliente.id_cliente.toString(),
                name: cliente.nombre_cliente,
                contacts: (cliente.get('contactos') as any[])?.map((contacto: any) => ({
                    id: contacto.id_contacto.toString(),
                    name: contacto.nombre_contacto,
                    email: contacto.email_contacto,
                    phone: contacto.telefono_contacto,
                    position: contacto.cargo_contacto,
                    city_id: contacto.ciudad?.id_ciudad || null,
                    city_name: contacto.ciudad?.nombre_comuna || '',
                    is_primary: false
                })) || []
            };

            sendSuccess(res, clienteTransformado, 'Cliente obtenido exitosamente');
            return res;
        } catch (error) {
            Logger.error('Error al obtener cliente:', error);
            sendError(res, 'Error al obtener cliente', 500);
            return res;
        }
    }

    /**
     * POST /api/clientes
     * Crear nuevo cliente con sus contactos
     */
    static async create(req: Request, res: Response): Promise<Response> {
        const transaction: Transaction = await sequelize.transaction();
        
        try {
            const { name, contacts } = req.body;

            if (!name || !name.trim()) {
                await transaction.rollback();
                sendError(res, 'El nombre del cliente es requerido', 400);
                return res;
            }

            if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
                await transaction.rollback();
                sendError(res, 'Debe proporcionar al menos un contacto', 400);
                return res;
            }

            const nuevoCliente = await Cliente.create({
                nombre_cliente: name.trim()
            }, { transaction });

            const contactosCreados = await Promise.all(
                contacts.map(async (contact: any) => {
                    let idCiudad: number | undefined = undefined;

                    if (contact.city_id) {
                        const comuna = await Comuna.findByPk(contact.city_id);
                        idCiudad = comuna?.id_ciudad;
                    }

                    if (!idCiudad) {
                        const comunaDefecto = await Comuna.findOne({
                            where: { nombre_comuna: 'Santiago' }
                        });
                        idCiudad = comunaDefecto?.id_ciudad || 1;
                    }

                    return await Contacto.create({
                        nombre_contacto: contact.name.trim(),
                        email_contacto: contact.email.trim(),
                        telefono_contacto: contact.phone.trim(),
                        cargo_contacto: contact.position?.trim() || 'Sin cargo',
                        id_ciudad: idCiudad,
                        id_cliente: nuevoCliente.id_cliente
                    }, { transaction });
                })
            );

            await transaction.commit();

            const respuesta = {
                id: nuevoCliente.id_cliente.toString(),
                name: nuevoCliente.nombre_cliente,
                contacts: contactosCreados.map(contacto => ({
                    id: contacto.id_contacto.toString(),
                    name: contacto.nombre_contacto,
                    email: contacto.email_contacto,
                    phone: contacto.telefono_contacto,
                    position: contacto.cargo_contacto,
                    city_id: contacto.id_ciudad,
                    city_name: '', // opcional cargar luego
                    is_primary: false
                }))
            };

            Logger.info(`Cliente creado: ${nuevoCliente.id_cliente}`);
            sendSuccess(res, respuesta, 'Cliente creado exitosamente', 201);
            return res;
        } catch (error: any) {
            await transaction.rollback();
            Logger.error('Error al crear cliente:', error);
            
            if (error.name === 'SequelizeUniqueConstraintError') {
                sendError(res, 'Ya existe un cliente con ese nombre', 400);
                return res;
            }
            
            sendError(res, 'Error al crear cliente', 500);
            return res;
        }
    }

    /**
     * PUT /api/clientes/:id
     * Actualizar cliente y sus contactos
     */
    static async update(req: Request, res: Response): Promise<Response> {
        const transaction: Transaction = await sequelize.transaction();
        
        try {
            const { id } = req.params;
            const { name, contacts } = req.body;

            const cliente = await Cliente.findByPk(id);
            if (!cliente) {
                await transaction.rollback();
                sendError(res, 'Cliente no encontrado', 404);
                return res;
            }

            if (!name || !name.trim()) {
                await transaction.rollback();
                sendError(res, 'El nombre del cliente es requerido', 400);
                return res;
            }

            if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
                await transaction.rollback();
                sendError(res, 'Debe proporcionar al menos un contacto', 400);
                return res;
            }

            await cliente.update({ nombre_cliente: name.trim() }, { transaction });

            const contactosActuales = await Contacto.findAll({
                where: { id_cliente: id },
                transaction
            });

            const idsContactosNuevos = contacts
                .filter(c => c.id && c.id !== '' && !isNaN(parseInt(c.id)))
                .map(c => parseInt(c.id));
            
            const contactosAEliminar = contactosActuales.filter(
                c => !idsContactosNuevos.includes(c.id_contacto)
            );

            for (const contacto of contactosAEliminar) {
                await contacto.destroy({ transaction });
            }

            const contactosActualizados = await Promise.all(
                contacts.map(async (contact: any) => {
                    let idCiudad: number | undefined = undefined;

                    if (contact.city_id) {
                        const comuna = await Comuna.findByPk(contact.city_id);
                        idCiudad = comuna?.id_ciudad;
                    }

                    if (!idCiudad) {
                        const comunaDefecto = await Comuna.findOne({
                            where: { nombre_comuna: 'Santiago' }
                        });
                        idCiudad = comunaDefecto?.id_ciudad || 1;
                    }

                    if (contact.id && contact.id !== '' && !isNaN(parseInt(contact.id))) {
                        const contactoExistente = await Contacto.findByPk(parseInt(contact.id));
                        if (contactoExistente) {
                            await contactoExistente.update({
                                nombre_contacto: contact.name.trim(),
                                email_contacto: contact.email.trim(),
                                telefono_contacto: contact.phone.trim(),
                                cargo_contacto: contact.position?.trim() || 'Sin cargo',
                                id_ciudad: idCiudad
                            }, { transaction });
                            return contactoExistente;
                        }
                    }
                    
                    return await Contacto.create({
                        nombre_contacto: contact.name.trim(),
                        email_contacto: contact.email.trim(),
                        telefono_contacto: contact.phone.trim(),
                        cargo_contacto: contact.position?.trim() || 'Sin cargo',
                        id_ciudad: idCiudad,
                        id_cliente: cliente.id_cliente
                    }, { transaction });
                })
            );

            await transaction.commit();

            const respuesta = {
                id: cliente.id_cliente.toString(),
                name: cliente.nombre_cliente,
                contacts: contactosActualizados.map(contacto => ({
                    id: contacto.id_contacto.toString(),
                    name: contacto.nombre_contacto,
                    email: contacto.email_contacto,
                    phone: contacto.telefono_contacto,
                    position: contacto.cargo_contacto,
                    city_id: contacto.id_ciudad,
                    city_name: '', // opcional cargar luego
                    is_primary: false
                }))
            };

            Logger.info(`Cliente actualizado: ${cliente.id_cliente}`);
            sendSuccess(res, respuesta, 'Cliente actualizado exitosamente');
            return res;
        } catch (error: any) {
            await transaction.rollback();
            Logger.error('Error al actualizar cliente:', error);
            
            if (error.name === 'SequelizeUniqueConstraintError') {
                sendError(res, 'Ya existe un cliente con ese nombre', 400);
                return res;
            }
            
            sendError(res, 'Error al actualizar cliente', 500);
            return res;
        }
    }

    /**
     * DELETE /api/clientes/:id
     */
    static async delete(req: Request, res: Response): Promise<Response> {
        const transaction: Transaction = await sequelize.transaction();
        
        try {
            const { id } = req.params;

            const cliente = await Cliente.findByPk(id, {
                include: [{ model: Contacto, as: 'contactos' }],
                transaction
            });

            if (!cliente) {
                await transaction.rollback();
                sendError(res, 'Cliente no encontrado', 404);
                return res;
            }

            const { Solicitud } = require('@/models');
            const contactos = cliente.get('contactos') as any[];
            const idsContactos = contactos.map(c => c.id_contacto);
            
            const solicitudesActivas = await Solicitud.count({
                where: { id_contacto: idsContactos },
                transaction
            });

            if (solicitudesActivas > 0) {
                await transaction.rollback();
                sendError(res, 'No se puede eliminar el cliente porque tiene solicitudes asociadas', 400);
                return res;
            }

            for (const contacto of contactos) {
                await contacto.destroy({ transaction });
            }

            await cliente.destroy({ transaction });

            await transaction.commit();

            Logger.info(`Cliente eliminado: ${id}`);
            sendSuccess(res, null, 'Cliente eliminado exitosamente');
            return res;
        } catch (error) {
            await transaction.rollback();
            Logger.error('Error al eliminar cliente:', error);
            sendError(res, 'Error al eliminar cliente', 500);
            return res;
        }
    }

    /**
     * GET /api/clientes/stats
     */
    static async getStats(req: Request, res: Response): Promise<Response> {
        try {
            const totalClientes = await Cliente.count();
            const totalContactos = await Contacto.count();

            const { Solicitud } = require('@/models');
            const clientesConSolicitudes = await Solicitud.findAll({
                attributes: [[sequelize.fn('DISTINCT', sequelize.col('Contacto.id_cliente')), 'id_cliente']],
                include: [{ model: Contacto, as: 'contacto', attributes: [] }],
                raw: true
            });

            const stats = {
                total_clientes: totalClientes,
                clientes_activos: clientesConSolicitudes.length,
                total_contactos: totalContactos
            };

            sendSuccess(res, stats, 'Estadísticas obtenidas exitosamente');
            return res;
        } catch (error) {
            Logger.error('Error al obtener estadísticas:', error);
            sendError(res, 'Error al obtener estadísticas', 500);
            return res;
        }
    }

    /**
     * GET /api/clientes/dropdown
     * Obtener clientes para dropdown
     */
    static async getDropdown(req: Request, res: Response): Promise<Response> {
        try {
            const clientes = await Cliente.findAll({
                attributes: ['id_cliente', 'nombre_cliente'],
                order: [['nombre_cliente', 'ASC']]
            });

            const lista = clientes.map(c => ({
                id: c.id_cliente.toString(),
                name: c.nombre_cliente
            }));

            sendSuccess(res, lista, 'Clientes para dropdown obtenidos');
            return res;
        } catch (error) {
            Logger.error('Error al obtener clientes dropdown:', error);
            sendError(res, 'Error al obtener clientes dropdown', 500);
            return res;
        }
    }
}
