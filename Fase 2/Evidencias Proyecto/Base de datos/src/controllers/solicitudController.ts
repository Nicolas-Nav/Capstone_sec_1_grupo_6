import { Request, Response } from 'express';
import { Transaction } from 'sequelize';
import sequelize from '@/config/database';
import {
    Solicitud,
    DescripcionCargo,
    Cliente,
    Contacto,
    Usuario,
    TipoServicio,
    EtapaSolicitud,
    EstadoSolicitud,
    EstadoSolicitudHist,
    Cargo,
    Comuna
} from '@/models';
import { sendSuccess, sendError } from '@/utils/response';
import { Logger } from '@/utils/logger';

/**
 * Controlador para gestión de Solicitudes (Process en frontend)
 * Mapeo Frontend → Backend:
 * - Process → Solicitud + DescripcionCargo
 * - position_title → titulo_cargo
 * - description → descripcion
 * - requirements → requisitos
 * - vacancies → num_vacantes
 * - service_type → codigo_servicio
 * - status → id_etapa_solicitud
 */

export class SolicitudController {
    /**
     * GET /api/solicitudes
     * Obtener todas las solicitudes con información completa
     */
    static async getAll(req: Request, res: Response): Promise<Response> {
        try {
            const { status, service_type, consultor_id } = req.query;

            const whereClause: any = {};
            
            // Filtros opcionales
            if (service_type) {
                whereClause.codigo_servicio = service_type;
            }
            if (consultor_id) {
                whereClause.rut_usuario = consultor_id;
            }

            const solicitudes = await Solicitud.findAll({
                where: whereClause,
                include: [
                    {
                        model: Contacto,
                        as: 'contacto',
                        include: [
                            {
                                model: Cliente,
                                as: 'cliente'
                            },
                            {
                                model: Comuna,
                                as: 'ciudad'
                            }
                        ]
                    },
                    {
                        model: TipoServicio,
                        as: 'tipoServicio'
                    },
                    {
                        model: DescripcionCargo,
                        as: 'descripcionCargo',
                        include: [
                            {
                                model: Cargo,
                                as: 'cargo'
                            },
                            {
                                model: Comuna,
                                as: 'ciudad'
                            }
                        ]
                    },
                    {
                        model: Usuario,
                        as: 'usuario',
                        attributes: ['rut_usuario', 'nombre_usuario', 'email_usuario']
                    },
                    {
                        model: EtapaSolicitud,
                        as: 'etapaSolicitud'
                    }
                ],
                order: [['fecha_ingreso_solicitud', 'DESC']]
            });

            // Transformar al formato del frontend
            const solicitudesTransformadas = solicitudes.map(solicitud => {
                const contacto = solicitud.get('contacto') as any;
                const cliente = contacto?.cliente;
                const descripcionCargo = solicitud.get('descripcionCargo') as any;
                const usuario = solicitud.get('usuario') as any;
                const tipoServicio = solicitud.get('tipoServicio') as any;
                const etapa = solicitud.get('etapaSolicitud') as any;

                return {
                    id: solicitud.id_solicitud.toString(),
                    client_id: cliente?.id_cliente.toString() || '',
                    client: {
                        id: cliente?.id_cliente.toString() || '',
                        name: cliente?.nombre_cliente || '',
                        contacts: [{
                            id: contacto?.id_contacto.toString() || '',
                            name: contacto?.nombre_contacto || '',
                            email: contacto?.email_contacto || '',
                            phone: contacto?.telefono_contacto || '',
                            position: contacto?.cargo_contacto || '',
                            city: contacto?.ciudad?.nombre_comuna || '',
                            is_primary: false
                        }]
                    },
                    contact_id: contacto?.id_contacto.toString() || '',
                    service_type: solicitud.codigo_servicio,
                    position_title: descripcionCargo?.descripcion_cargo || '',
                    description: descripcionCargo?.descripcion_cargo || '',
                    requirements: descripcionCargo?.requisitos_y_condiciones || '',
                    vacancies: descripcionCargo?.num_vacante || 0,
                    consultant_id: usuario?.rut_usuario || '',
                    consultant: {
                        id: usuario?.rut_usuario || '',
                        name: usuario?.nombre_usuario || '',
                        email: usuario?.email_usuario || '',
                        role: 'consultor' as const
                    },
                    status: this.mapEstadoToFrontend(etapa?.nombre_etapa),
                    created_at: solicitud.fecha_ingreso_solicitud.toISOString(),
                    started_at: null, // Se puede calcular del historial
                    completed_at: null, // Se puede calcular del historial
                    excel_file: descripcionCargo?.archivo_excel || undefined
                };
            });

            return sendSuccess(res, solicitudesTransformadas, 'Solicitudes obtenidas exitosamente');
        } catch (error) {
            Logger.error('Error al obtener solicitudes:', error);
            return sendError(res, 'Error al obtener solicitudes', 500);
        }
    }

    /**
     * GET /api/solicitudes/:id
     * Obtener una solicitud específica
     */
    static async getById(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;

            const solicitud = await Solicitud.findByPk(id, {
                include: [
                    {
                        model: Contacto,
                        as: 'contacto',
                        include: [
                            { model: Cliente, as: 'cliente' },
                            { model: Comuna, as: 'ciudad' }
                        ]
                    },
                    { model: TipoServicio, as: 'tipoServicio' },
                    {
                        model: DescripcionCargo,
                        as: 'descripcionCargo',
                        include: [
                            { model: Cargo, as: 'cargo' },
                            { model: Comuna, as: 'ciudad' }
                        ]
                    },
                    {
                        model: Usuario,
                        as: 'usuario',
                        attributes: ['rut_usuario', 'nombre_usuario', 'email_usuario']
                    },
                    { model: EtapaSolicitud, as: 'etapaSolicitud' }
                ]
            });

            if (!solicitud) {
                return sendError(res, 'Solicitud no encontrada', 404);
            }

            // Transformar (mismo formato que getAll)
            const contacto = solicitud.get('contacto') as any;
            const cliente = contacto?.cliente;
            const descripcionCargo = solicitud.get('descripcionCargo') as any;
            const usuario = solicitud.get('usuario') as any;
            const etapa = solicitud.get('etapaSolicitud') as any;

            const solicitudTransformada = {
                id: solicitud.id_solicitud.toString(),
                client_id: cliente?.id_cliente.toString() || '',
                client: {
                    id: cliente?.id_cliente.toString() || '',
                    name: cliente?.nombre_cliente || '',
                contacts: [{
                    id: contacto?.id_contacto.toString() || '',
                    name: contacto?.nombre_contacto || '',
                    email: contacto?.email_contacto || '',
                    phone: contacto?.telefono_contacto || '',
                    position: contacto?.cargo_contacto || '',
                    city: contacto?.ciudad?.nombre_comuna || '',
                    is_primary: false
                }]
                },
                contact_id: contacto?.id_contacto.toString() || '',
                service_type: solicitud.codigo_servicio,
                position_title: descripcionCargo?.titulo_cargo || '',
                description: descripcionCargo?.descripcion || '',
                requirements: descripcionCargo?.requisitos || '',
                vacancies: descripcionCargo?.num_vacantes || 0,
                consultant_id: usuario?.rut_usuario || '',
                consultant: {
                    id: usuario?.rut_usuario || '',
                    name: usuario?.nombre_usuario || '',
                    email: usuario?.email_usuario || '',
                    role: 'consultor' as const
                },
                status: this.mapEstadoToFrontend(etapa?.nombre_etapa),
                created_at: solicitud.fecha_ingreso_solicitud.toISOString(),
                started_at: null,
                completed_at: null,
                excel_file: descripcionCargo?.archivo_excel || undefined
            };

            return sendSuccess(res, solicitudTransformada, 'Solicitud obtenida exitosamente');
        } catch (error) {
            Logger.error('Error al obtener solicitud:', error);
            return sendError(res, 'Error al obtener solicitud', 500);
        }
    }

    /**
     * GET /api/solicitudes/consultor/:rutUsuario
     * Obtener solicitudes por consultor
     */
    static async getByConsultor(req: Request, res: Response): Promise<Response> {
        try {
            const { rutUsuario } = req.params;
            const { status } = req.query;

            req.query.consultor_id = rutUsuario;
            return await this.getAll(req, res);
        } catch (error) {
            Logger.error('Error al obtener solicitudes por consultor:', error);
            return sendError(res, 'Error al obtener solicitudes', 500);
        }
    }

    /**
     * POST /api/solicitudes
     * Crear nueva solicitud con descripción de cargo
     */
    static async create(req: Request, res: Response): Promise<Response> {
        const transaction: Transaction = await sequelize.transaction();
        
        try {
            const {
                contact_id,
                service_type,
                position_title,
                description,
                requirements,
                vacancies,
                consultant_id,
                deadline_days = 30 // Días para el plazo
            } = req.body;

            // Validaciones
            if (!contact_id || !service_type || !position_title || !consultant_id) {
                await transaction.rollback();
                return sendError(res, 'Faltan campos requeridos', 400);
            }

            // Verificar que existe el contacto
            const contacto = await Contacto.findByPk(contact_id);
            if (!contacto) {
                await transaction.rollback();
                return sendError(res, 'Contacto no encontrado', 404);
            }

            // Verificar que existe el usuario
            const usuario = await Usuario.findByPk(consultant_id);
            if (!usuario) {
                await transaction.rollback();
                return sendError(res, 'Usuario no encontrado', 404);
            }

            // Buscar o crear el cargo
            let cargo = await Cargo.findOne({
                where: { nombre_cargo: position_title.trim() }
            });

            if (!cargo) {
                cargo = await Cargo.create({
                    nombre_cargo: position_title.trim()
                }, { transaction });
            }

            // Crear descripción de cargo
            const descripcionCargo = await DescripcionCargo.create({
                descripcion_cargo: description?.trim() || position_title.trim(),
                requisitos_y_condiciones: requirements?.trim() || '',
                num_vacante: vacancies || 1,
                fecha_ingreso: new Date(),
                id_cargo: cargo.id_cargo,
                id_ciudad: 1 // Se puede agregar lógica para mapear ciudad (usando Santiago como default)
            }, { transaction });

            // Obtener etapa inicial
            const etapaInicial = await EtapaSolicitud.findOne({
                where: { nombre_etapa: 'Creada' }
            });

            if (!etapaInicial) {
                await transaction.rollback();
                return sendError(res, 'No se encontró la etapa inicial', 500);
            }

            // Calcular plazo máximo
            const fechaIngreso = new Date();
            const plazoMaximo = new Date();
            plazoMaximo.setDate(plazoMaximo.getDate() + deadline_days);

            // Crear solicitud
            const nuevaSolicitud = await Solicitud.create({
                plazo_maximo_solicitud: plazoMaximo,
                fecha_ingreso_solicitud: fechaIngreso,
                id_contacto: contact_id,
                codigo_servicio: service_type,
                id_descripcioncargo: descripcionCargo.id_descripcioncargo,
                rut_usuario: consultant_id,
                id_etapa_solicitud: etapaInicial.id_etapa_solicitud
            }, { transaction });

            // Crear historial de estado
            const estadoInicial = await EstadoSolicitud.findOne({
                where: { nombre_estado_solicitud: 'Creada' }
            });

            if (estadoInicial) {
                await EstadoSolicitudHist.create({
                    fecha_cambio_estado_solicitud: new Date(),
                    id_estado_solicitud: estadoInicial.id_estado_solicitud,
                    id_solicitud: nuevaSolicitud.id_solicitud
                }, { transaction });
            }

            await transaction.commit();

            // Cargar solicitud completa para respuesta
            const solicitudCompleta = await Solicitud.findByPk(nuevaSolicitud.id_solicitud, {
                include: [
                    {
                        model: Contacto,
                        as: 'contacto',
                        include: [{ model: Cliente, as: 'cliente' }]
                    },
                    { model: DescripcionCargo, as: 'descripcionCargo' },
                    { model: Usuario, as: 'usuario' },
                    { model: EtapaSolicitud, as: 'etapaSolicitud' }
                ]
            });

            Logger.info(`Solicitud creada: ${nuevaSolicitud.id_solicitud}`);
            return sendSuccess(res, { id: nuevaSolicitud.id_solicitud }, 'Solicitud creada exitosamente', 201);
        } catch (error: any) {
            await transaction.rollback();
            Logger.error('Error al crear solicitud:', error);
            return sendError(res, 'Error al crear solicitud', 500);
        }
    }

    /**
     * PUT /api/solicitudes/:id/estado
     * Cambiar estado/etapa de la solicitud
     */
    static async updateEstado(req: Request, res: Response): Promise<Response> {
        const transaction: Transaction = await sequelize.transaction();
        
        try {
            const { id } = req.params;
            const { status, reason } = req.body; // status del frontend: 'creado', 'iniciado', etc.

            const solicitud = await Solicitud.findByPk(id);
            if (!solicitud) {
                await transaction.rollback();
                return sendError(res, 'Solicitud no encontrada', 404);
            }

            // Mapear estado del frontend al backend
            const nombreEtapa = this.mapEstadoToBackend(status);
            
            const nuevaEtapa = await EtapaSolicitud.findOne({
                where: { nombre_etapa: nombreEtapa }
            });

            if (!nuevaEtapa) {
                await transaction.rollback();
                return sendError(res, 'Etapa no válida', 400);
            }

            // Actualizar etapa
            await solicitud.update({
                id_etapa_solicitud: nuevaEtapa.id_etapa_solicitud
            }, { transaction });

            // Crear registro en historial
            const estado = await EstadoSolicitud.findOne({
                where: { nombre_estado_solicitud: nombreEtapa }
            });

            if (estado) {
                await EstadoSolicitudHist.create({
                    fecha_cambio_estado_solicitud: new Date(),
                    id_estado_solicitud: estado.id_estado_solicitud,
                    id_solicitud: solicitud.id_solicitud
                }, { transaction });
            }

            await transaction.commit();

            Logger.info(`Estado actualizado para solicitud ${id}: ${status}`);
            return sendSuccess(res, null, 'Estado actualizado exitosamente');
        } catch (error) {
            await transaction.rollback();
            Logger.error('Error al actualizar estado:', error);
            return sendError(res, 'Error al actualizar estado', 500);
        }
    }

    /**
     * DELETE /api/solicitudes/:id
     * Eliminar solicitud
     */
    static async delete(req: Request, res: Response): Promise<Response> {
        const transaction: Transaction = await sequelize.transaction();
        
        try {
            const { id } = req.params;

            const solicitud = await Solicitud.findByPk(id);
            if (!solicitud) {
                await transaction.rollback();
                return sendError(res, 'Solicitud no encontrada', 404);
            }

            // Eliminar historial de estados
            await EstadoSolicitudHist.destroy({
                where: { id_solicitud: id },
                transaction
            });

            // Eliminar solicitud
            await solicitud.destroy({ transaction });

            await transaction.commit();

            Logger.info(`Solicitud eliminada: ${id}`);
            return sendSuccess(res, null, 'Solicitud eliminada exitosamente');
        } catch (error) {
            await transaction.rollback();
            Logger.error('Error al eliminar solicitud:', error);
            return sendError(res, 'Error al eliminar solicitud', 500);
        }
    }

    /**
     * Mapear estado del frontend al backend
     */
    private static mapEstadoToBackend(status: string): string {
        const mapeo: { [key: string]: string } = {
            'creado': 'Creada',
            'iniciado': 'Iniciada',
            'en_progreso': 'En Progreso',
            'completado': 'Completada',
            'cancelado': 'Cancelada',
            'congelado': 'Congelada'
        };
        return mapeo[status] || 'Creada';
    }

    /**
     * Mapear estado del backend al frontend
     */
    private static mapEstadoToFrontend(nombreEtapa?: string): string {
        if (!nombreEtapa) return 'creado';
        
        const mapeo: { [key: string]: string } = {
            'Creada': 'creado',
            'Iniciada': 'iniciado',
            'En Progreso': 'en_progreso',
            'Completada': 'completado',
            'Cancelada': 'cancelado',
            'Congelada': 'congelado'
        };
        return mapeo[nombreEtapa] || 'creado';
    }
}
