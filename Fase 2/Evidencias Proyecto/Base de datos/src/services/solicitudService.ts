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

/**
 * Servicio para gestión de Solicitudes
 * Contiene toda la lógica de negocio relacionada con solicitudes de reclutamiento
 */

export class SolicitudService {
    /**
     * Obtener todas las solicitudes con filtros opcionales
     */
    static async getAllSolicitudes(filters?: {
        status?: string;
        service_type?: string;
        consultor_id?: string;
    }) {
        const whereClause: any = {};

        if (filters?.service_type) {
            whereClause.codigo_servicio = filters.service_type;
        }
        if (filters?.consultor_id) {
            whereClause.rut_usuario = filters.consultor_id;
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
                            as: 'comuna'
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
                            as: 'comuna'
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
        return solicitudes.map(solicitud => this.transformSolicitud(solicitud));
    }

    /**
     * Obtener una solicitud por ID
     */
    static async getSolicitudById(id: number) {
        const solicitud = await Solicitud.findByPk(id, {
            include: [
                {
                    model: Contacto,
                    as: 'contacto',
                    include: [
                        { model: Cliente, as: 'cliente' },
                        { model: Comuna, as: 'comuna' }
                    ]
                },
                { model: TipoServicio, as: 'tipoServicio' },
                {
                    model: DescripcionCargo,
                    as: 'descripcionCargo',
                    include: [
                        { model: Cargo, as: 'cargo' },
                        { model: Comuna, as: 'comuna' }
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
            return null;
        }

        return this.transformSolicitud(solicitud);
    }

    /**
     * Crear nueva solicitud
     */
    static async createSolicitud(data: {
        contact_id: number;
        service_type: string;
        position_title: string;
        ciudad?: string;
        description?: string;
        requirements?: string;
        vacancies?: number;
        consultant_id: string;
        deadline_days?: number;
    }) {
        const transaction: Transaction = await sequelize.transaction();

        try {
            const {
                contact_id,
                service_type,
                position_title,
                ciudad,
                description,
                requirements,
                vacancies,
                consultant_id,
                deadline_days = 30
            } = data;

            // Validaciones
            if (!contact_id || !service_type || !position_title || !consultant_id) {
                throw new Error('Faltan campos requeridos');
            }

            // Verificar que existe el contacto
            const contacto = await Contacto.findByPk(contact_id);
            if (!contacto) {
                throw new Error('Contacto no encontrado');
            }

            // Verificar que existe el usuario
            const usuario = await Usuario.findByPk(consultant_id);
            if (!usuario) {
                throw new Error('Usuario no encontrado');
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

            // Buscar la comuna
            let idComuna = 1; // Por defecto Santiago
            if (ciudad) {
                const comuna = await Comuna.findOne({
                    where: { nombre_comuna: ciudad.trim() }
                });
                if (comuna) {
                    idComuna = comuna.id_comuna;
                }
            }

            // Determinar la etapa inicial según el tipo de servicio
            // TS y ES empiezan en Módulo 4: Evaluación Psicolaboral (id = 4)
            // PC, LL, HH empiezan en Módulo 1: Registro y Gestión de Solicitudes (id = 1)
            const idEtapaInicial = (service_type === 'TS' || service_type === 'ES') ? 4 : 1;

            // Calcular plazo máximo
            const fechaIngreso = new Date();
            const plazoMaximo = new Date();
            plazoMaximo.setDate(plazoMaximo.getDate() + deadline_days);

            // 1️⃣ Primero crear la solicitud
            const nuevaSolicitud = await Solicitud.create({
                plazo_maximo_solicitud: plazoMaximo,
                fecha_ingreso_solicitud: fechaIngreso,
                id_contacto: contact_id,
                codigo_servicio: service_type,
                rut_usuario: consultant_id,
                id_etapa_solicitud: idEtapaInicial
            }, { transaction });

            // 2️⃣ Luego crear la descripción de cargo vinculada a la solicitud
            const descripcionCargoData: any = {
                descripcion_cargo: description?.trim() || position_title.trim(),
                num_vacante: vacancies || 1,
                fecha_ingreso: fechaIngreso,
                id_cargo: cargo.id_cargo,
                id_comuna: idComuna,
                id_solicitud: nuevaSolicitud.id_solicitud
            };

            // Solo agregar requisitos si no está vacío
            if (requirements && requirements.trim()) {
                descripcionCargoData.requisitos_y_condiciones = requirements.trim();
            } else {
                descripcionCargoData.requisitos_y_condiciones = 'Por definir';
            }

            const nuevaDescripcionCargo = await DescripcionCargo.create(descripcionCargoData, { transaction });

            // Crear historial de estado (usar el mismo ID de etapa)
            await EstadoSolicitudHist.create({
                fecha_cambio_estado_solicitud: new Date(),
                id_estado_solicitud: idEtapaInicial,
                id_solicitud: nuevaSolicitud.id_solicitud
            }, { transaction });

            await transaction.commit();

            return { 
                id: nuevaSolicitud.id_solicitud,
                id_descripcion_cargo: nuevaDescripcionCargo.id_descripcioncargo
            };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Actualizar estado de solicitud
     */
    static async updateEstado(id: number, data: { status: string; reason?: string }) {
        const transaction: Transaction = await sequelize.transaction();

        try {
            const { status, reason } = data;

            const solicitud = await Solicitud.findByPk(id);
            if (!solicitud) {
                throw new Error('Solicitud no encontrada');
            }

            // Mapear estado del frontend al backend
            const nombreEtapa = this.mapEstadoToBackend(status);

            const nuevaEtapa = await EtapaSolicitud.findOne({
                where: { nombre_etapa: nombreEtapa }
            });

            if (!nuevaEtapa) {
                throw new Error('Etapa no válida');
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

            return { id, status };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Eliminar solicitud
     */
    static async deleteSolicitud(id: number) {
        const transaction: Transaction = await sequelize.transaction();

        try {
            const solicitud = await Solicitud.findByPk(id);
            if (!solicitud) {
                throw new Error('Solicitud no encontrada');
            }

            // Eliminar historial de estados
            await EstadoSolicitudHist.destroy({
                where: { id_solicitud: id },
                transaction
            });

            // Eliminar solicitud
            await solicitud.destroy({ transaction });

            await transaction.commit();

            return { id };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Transformar solicitud a formato frontend
     */
    private static transformSolicitud(solicitud: any) {
        const contacto = solicitud.get('contacto') as any;
        const cliente = contacto?.cliente;
        const descripcionCargo = solicitud.get('descripcionCargo') as any;
        const cargo = descripcionCargo?.cargo;
        const tipoServicio = solicitud.get('tipoServicio') as any;
        const usuario = solicitud.get('usuario') as any;
        const etapa = solicitud.get('etapaSolicitud') as any;

        return {
            // Formato completo para APIs que necesitan toda la información
            id: solicitud.id_solicitud,
            id_solicitud: solicitud.id_solicitud,
            id_descripcion_cargo: descripcionCargo?.id_descripcion_cargo || 0,
            
            // Información básica para la tabla
            cargo: cargo?.nombre_cargo || 'Sin cargo',
            cliente: cliente?.nombre_cliente || 'Sin cliente',
            tipo_servicio: solicitud.codigo_servicio,
            tipo_servicio_nombre: tipoServicio?.nombre_servicio || solicitud.codigo_servicio,
            consultor: usuario?.nombre_usuario || 'Sin asignar',
            estado: etapa?.nombre_etapa || 'Creada',
            fecha_creacion: solicitud.fecha_ingreso_solicitud,
            
            // Información detallada (para compatibilidad con otros componentes)
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
                    city: contacto?.comuna?.nombre_comuna || '',
                    is_primary: false
                }]
            },
            contact_id: contacto?.id_contacto.toString() || '',
            service_type: solicitud.codigo_servicio,
            position_title: cargo?.nombre_cargo || 'Sin cargo',
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
            started_at: null,
            completed_at: null,
            excel_file: descripcionCargo?.archivo_excel || undefined
        };
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

