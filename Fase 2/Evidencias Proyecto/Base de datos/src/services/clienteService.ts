import { Transaction } from 'sequelize';
import sequelize from '@/config/database';
import { Cliente, Contacto, Comuna } from '@/models';

/**
 * Servicio para gestión de Clientes
 * Contiene toda la lógica de negocio relacionada con clientes y contactos
 */

export class ClienteService {
    /**
     * Obtener todos los clientes con sus contactos
     */
    static async getAllClientes() {
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
        return clientes.map(cliente => ({
            id: cliente.id_cliente.toString(),
            name: cliente.nombre_cliente,
            contacts: (cliente.get('contactos') as any[])?.map((contacto: any) => ({
                id: contacto.id_contacto.toString(),
                name: contacto.nombre_contacto,
                email: contacto.email_contacto,
                phone: contacto.telefono_contacto,
                position: contacto.cargo_contacto,
                city: contacto.ciudad?.nombre_comuna || '',
                is_primary: false
            })) || []
        }));
    }

    /**
     * Obtener un cliente por ID
     */
    static async getClienteById(id: number) {
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
            return null;
        }

        // Transformar al formato del frontend
        return {
            id: cliente.id_cliente.toString(),
            name: cliente.nombre_cliente,
            contacts: (cliente.get('contactos') as any[])?.map((contacto: any) => ({
                id: contacto.id_contacto.toString(),
                name: contacto.nombre_contacto,
                email: contacto.email_contacto,
                phone: contacto.telefono_contacto,
                position: contacto.cargo_contacto,
                city: contacto.ciudad?.nombre_comuna || '',
                is_primary: false
            })) || []
        };
    }

    /**
     * Crear nuevo cliente con contactos
     */
    static async createCliente(data: { name: string; contacts: any[] }) {
        const transaction: Transaction = await sequelize.transaction();

        try {
            const { name, contacts } = data;

            // Validaciones
            if (!name || !name.trim()) {
                throw new Error('El nombre del cliente es requerido');
            }

            if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
                throw new Error('Debe proporcionar al menos un contacto');
            }

            // Crear el cliente
            const nuevoCliente = await Cliente.create({
                nombre_cliente: name.trim()
            }, { transaction });

            // Buscar comunas por nombre para los contactos
            const contactosCreados = await Promise.all(
                contacts.map(async (contact: any) => {
                    let idCiudad: number | undefined = undefined;

                    if (contact.city && contact.city.trim()) {
                        const comuna = await Comuna.findOne({
                            where: { nombre_comuna: contact.city.trim() }
                        });
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

            // Obtener los contactos creados con sus comunas (sin transacción)
            const contactosConComunas = await Contacto.findAll({
                where: { id_cliente: nuevoCliente.id_cliente },
                include: [
                    {
                        model: Comuna,
                        as: 'ciudad',
                        attributes: ['id_ciudad', 'nombre_comuna']
                    }
                ]
            });

            // Respuesta en formato frontend
            return {
                id: nuevoCliente.id_cliente.toString(),
                name: nuevoCliente.nombre_cliente,
                contacts: contactosConComunas.map(contacto => ({
                    id: contacto.id_contacto.toString(),
                    name: contacto.nombre_contacto,
                    email: contacto.email_contacto,
                    phone: contacto.telefono_contacto,
                    position: contacto.cargo_contacto,
                    city: (contacto as any).ciudad?.nombre_comuna || '',
                    is_primary: false
                }))
            };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Actualizar cliente y sus contactos
     */
    static async updateCliente(id: number, data: { name: string; contacts: any[] }) {
        const transaction: Transaction = await sequelize.transaction();

        try {
            const { name, contacts } = data;

            const cliente = await Cliente.findByPk(id);
            if (!cliente) {
                throw new Error('Cliente no encontrado');
            }

            // Validaciones
            if (!name || !name.trim()) {
                throw new Error('El nombre del cliente es requerido');
            }

            if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
                throw new Error('Debe proporcionar al menos un contacto');
            }

            // Actualizar nombre del cliente
            await cliente.update({ nombre_cliente: name.trim() }, { transaction });

            // Gestionar contactos
            const contactosActuales = await Contacto.findAll({
                where: { id_cliente: id },
                transaction
            });

            const idsContactosNuevos = contacts
                .filter(c => c.id && c.id !== '')
                .map(c => parseInt(c.id));

            const contactosAEliminar = contactosActuales.filter(
                c => !idsContactosNuevos.includes(c.id_contacto)
            );

            // Eliminar contactos que ya no están
            for (const contacto of contactosAEliminar) {
                await contacto.destroy({ transaction });
            }

            // Actualizar o crear contactos
            const contactosActualizados = await Promise.all(
                contacts.map(async (contact: any) => {
                    let idCiudad: number | undefined = undefined;

                    if (contact.city && contact.city.trim()) {
                        const comuna = await Comuna.findOne({
                            where: { nombre_comuna: contact.city.trim() }
                        });
                        idCiudad = comuna?.id_ciudad;
                    }

                    if (!idCiudad) {
                        const comunaDefecto = await Comuna.findOne({
                            where: { nombre_comuna: 'Santiago' }
                        });
                        idCiudad = comunaDefecto?.id_ciudad || 1;
                    }

                    if (contact.id && contact.id !== '') {
                        const contactoExistente = await Contacto.findByPk(contact.id);
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

            // Obtener los contactos actualizados con sus comunas (sin transacción)
            const contactosConComunas = await Contacto.findAll({
                where: { id_cliente: id },
                include: [
                    {
                        model: Comuna,
                        as: 'ciudad',
                        attributes: ['id_ciudad', 'nombre_comuna']
                    }
                ]
            });

            return {
                id: cliente.id_cliente.toString(),
                name: cliente.nombre_cliente,
                contacts: contactosConComunas.map(contacto => ({
                    id: contacto.id_contacto.toString(),
                    name: contacto.nombre_contacto,
                    email: contacto.email_contacto,
                    phone: contacto.telefono_contacto,
                    position: contacto.cargo_contacto,
                    city: (contacto as any).ciudad?.nombre_comuna || '',
                    is_primary: false
                }))
            };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Eliminar cliente
     */
    static async deleteCliente(id: number) {
        const transaction: Transaction = await sequelize.transaction();

        try {
            const cliente = await Cliente.findByPk(id, {
                include: [
                    {
                        model: Contacto,
                        as: 'contactos'
                    }
                ],
                transaction
            });

            if (!cliente) {
                throw new Error('Cliente no encontrado');
            }

            // Verificar si tiene solicitudes asociadas
            const { Solicitud } = require('@/models');
            const contactos = cliente.get('contactos') as any[];
            const idsContactos = contactos.map(c => c.id_contacto);

            const solicitudesActivas = await Solicitud.count({
                where: {
                    id_contacto: idsContactos
                },
                transaction
            });

            if (solicitudesActivas > 0) {
                throw new Error('No se puede eliminar el cliente porque tiene solicitudes asociadas');
            }

            // Eliminar contactos
            for (const contacto of contactos) {
                await contacto.destroy({ transaction });
            }

            // Eliminar cliente
            await cliente.destroy({ transaction });

            await transaction.commit();

            return { id };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Obtener estadísticas de clientes
     */
    static async getStats() {
        const totalClientes = await Cliente.count();
        const totalContactos = await Contacto.count();

        const { Solicitud } = require('@/models');
        const clientesConSolicitudes = await Solicitud.findAll({
            attributes: [[sequelize.fn('DISTINCT', sequelize.col('Contacto.id_cliente')), 'id_cliente']],
            include: [
                {
                    model: Contacto,
                    as: 'contacto',
                    attributes: []
                }
            ],
            raw: true
        });

        return {
            total_clientes: totalClientes,
            clientes_activos: clientesConSolicitudes.length,
            total_contactos: totalContactos
        };
    }
}

