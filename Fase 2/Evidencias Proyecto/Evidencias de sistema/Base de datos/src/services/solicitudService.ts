import { Transaction, Op } from 'sequelize';
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
     * Obtener solicitudes paginadas con filtros opcionales y orden
     */
    static async getSolicitudes(
        page: number = 1,
        limit: number = 10,
        search: string = "",
        status?: "creado" | "en_progreso" | "cerrado" | "congelado" | "cancelado" | "cierre_extraordinario",
        service_type?: string,
        consultor_id?: string,
        sortBy: "fecha" | "cargo" | "cliente" = "fecha",
        sortOrder: "ASC" | "DESC" = "DESC"
    ) {
        const offset = (page - 1) * limit;

        const andConditions: any[] = [];

        // Filtro de búsqueda por texto
        if (search) {
            andConditions.push({
                [Op.or]: [
                    { '$descripcionCargo.cargo.nombre_cargo$': { [Op.iLike]: `%${search}%` } },
                    { '$contacto.cliente.nombre_cliente$': { [Op.iLike]: `%${search}%` } },
                    { '$usuario.nombre_usuario$': { [Op.iLike]: `%${search}%` } },
                    { '$contacto.nombre_contacto$': { [Op.iLike]: `%${search}%` } }
                ]
            });
        }

        // Filtro por estado
        if (status) {
            // Buscar IDs de solicitudes con el estado específico
            const solicitudesConEstado = await EstadoSolicitudHist.findAll({
                include: [
                    {
                        model: EstadoSolicitud,
                        as: 'estado',
                        where: {
                            nombre_estado_solicitud: {
                                [Op.iLike]: `%${status === 'creado' ? 'Creado' : 
                                           status === 'en_progreso' ? 'En Progreso' :
                                           status === 'cerrado' ? 'Cerrado' : 
                                           status === 'congelado' ? 'Congelado' : 
                                           status === 'cancelado' ? 'Cancelado' : 'Cierre Extraordinario'}%`
                            }
                        },
                        attributes: []
                    }
                ],
                attributes: ['id_solicitud'],
                raw: true,
                order: [['fecha_cambio_estado_solicitud', 'DESC']]
            });

            // Agrupar por id_solicitud y tomar el más reciente
            const estadoMap = new Map();
            solicitudesConEstado.forEach(item => {
                if (!estadoMap.has(item.id_solicitud)) {
                    estadoMap.set(item.id_solicitud, item.id_solicitud);
                }
            });

            const idsConEstado = Array.from(estadoMap.values());
            if (idsConEstado.length > 0) {
                andConditions.push({ id_solicitud: { [Op.in]: idsConEstado } });
            } else {
                // Si no hay solicitudes con ese estado, devolver array vacío
                andConditions.push({ id_solicitud: { [Op.in]: [] } });
            }
        }

        // Filtro por tipo de servicio
        if (service_type) {
            andConditions.push({ codigo_servicio: service_type });
        }

        // Filtro por consultor
        if (consultor_id) {
            andConditions.push({ rut_usuario: consultor_id });
        }

        // Construir la condición final
        const where = andConditions.length > 0 ? { [Op.and]: andConditions } : {};

        // Determinar columna para ordenar
        let orderColumn = 'fecha_ingreso_solicitud';
        if (sortBy === 'cargo') {
            orderColumn = '$descripcionCargo.cargo.nombre_cargo$';
        } else if (sortBy === 'cliente') {
            orderColumn = '$contacto.cliente.nombre_cliente$';
        }

        const { count, rows } = await Solicitud.findAndCountAll({
            where,
            limit,
            offset,
            order: [[orderColumn, sortOrder]],
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
                },
                {
                    model: EstadoSolicitudHist,
                    as: 'historialEstados',
                    include: [{
                        model: EstadoSolicitud,
                        as: 'estado'
                    }],
                    limit: 1,
                    order: [['fecha_cambio_estado_solicitud', 'DESC']]
                }
            ],
            distinct: true, // Importante para contar correctamente con includes
        });

        // Transformar al formato del frontend
        const transformedSolicitudes = rows.map(solicitud => this.transformSolicitud(solicitud));

        return {
            solicitudes: transformedSolicitudes,
            pagination: {
                page,
                limit,
                total: count,
                totalPages: Math.ceil(count / limit),
            },
        };
    }

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
                },
                {
                    model: EstadoSolicitudHist,
                    as: 'historialEstados',
                    include: [{
                        model: EstadoSolicitud,
                        as: 'estado'
                    }],
                    limit: 1,
                    order: [['fecha_cambio_estado_solicitud', 'DESC']]
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
                { model: EtapaSolicitud, as: 'etapaSolicitud' },
                {
                    model: EstadoSolicitudHist,
                    as: 'historialEstados',
                    include: [{
                        model: EstadoSolicitud,
                        as: 'estado'
                    }],
                    limit: 1,
                    order: [['fecha_cambio_estado_solicitud', 'DESC']]
                }
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

            // Primero crear la solicitud
            const nuevaSolicitud = await Solicitud.create({
                plazo_maximo_solicitud: plazoMaximo,
                fecha_ingreso_solicitud: fechaIngreso,
                id_contacto: contact_id,
                codigo_servicio: service_type,
                rut_usuario: consultant_id,
                id_etapa_solicitud: idEtapaInicial
            }, { transaction });

            // Luego crear la descripción de cargo vinculada a la solicitud
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

            // Crear historial de estado inicial (estado = "Creado" = ID 1)
                await EstadoSolicitudHist.create({
                    fecha_cambio_estado_solicitud: new Date(),
                id_estado_solicitud: 1, // "Creado"
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
     * Actualizar solicitud y su descripción de cargo
     */
    static async updateSolicitud(id: number, data: {
        contact_id?: number;
        service_type?: string;
        position_title?: string;
        ciudad?: string;
        description?: string;
        requirements?: string;
        vacancies?: number;
        consultant_id?: string;
        deadline_days?: number;
    }) {
        const transaction: Transaction = await sequelize.transaction();

        try {
            const solicitud = await Solicitud.findByPk(id, {
                include: [{ model: DescripcionCargo, as: 'descripcionCargo' }]
            });

            if (!solicitud) {
                throw new Error('Solicitud no encontrada');
            }

            // Actualizar campos de la solicitud
            if (data.contact_id) solicitud.id_contacto = data.contact_id;
            if (data.service_type) solicitud.codigo_servicio = data.service_type;
            if (data.consultant_id) solicitud.rut_usuario = data.consultant_id;

            // Recalcular fecha límite si se envía
            if (data.deadline_days) {
                const nuevaFecha = new Date();
                nuevaFecha.setDate(nuevaFecha.getDate() + data.deadline_days);
                solicitud.plazo_maximo_solicitud = nuevaFecha;
            }

            await solicitud.save({ transaction });

            // Actualizar descripción de cargo asociada
            const descripcionCargo = (solicitud as any).descripcionCargo;
            if (descripcionCargo) {
                if (data.position_title) {
                    let cargo = await Cargo.findOne({
                        where: { nombre_cargo: data.position_title.trim() }
                    });
                    if (!cargo) {
                        cargo = await Cargo.create({
                            nombre_cargo: data.position_title.trim()
                        }, { transaction });
                    }
                    descripcionCargo.id_cargo = cargo.id_cargo;
                }

                if (data.description) descripcionCargo.descripcion_cargo = data.description.trim();
                if (data.requirements) descripcionCargo.requisitos_y_condiciones = data.requirements.trim();
                if (data.vacancies) descripcionCargo.num_vacante = data.vacancies;

                if (data.ciudad) {
                    const comuna = await Comuna.findOne({
                        where: { nombre_comuna: data.ciudad.trim() }
                    });
                    if (comuna) {
                        descripcionCargo.id_comuna = comuna.id_comuna;
                    }
                }

                await descripcionCargo.save({ transaction });
            }

            await transaction.commit();

            return { 
                id: solicitud.id_solicitud,
                id_descripcion_cargo: descripcionCargo?.id_descripcioncargo || null,
                message: 'Solicitud actualizada exitosamente'
            };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Actualizar estado de solicitud (Creado, En Progreso, Cerrado, Congelado)
     */
    static async updateEstado(id: number, data: { status: string; reason?: string }) {
        const transaction: Transaction = await sequelize.transaction();

        try {
            const { status, reason } = data;

            const solicitud = await Solicitud.findByPk(id);
            if (!solicitud) {
                throw new Error('Solicitud no encontrada');
            }

            // Mapear estado del frontend al backend (ID de base de datos)
            const mapeoEstadoId: Record<string, number> = {
                'creado': 1,                    // Creado
                'en_progreso': 2,              // En Progreso
                'cerrado': 3,                  // Cerrado
                'congelado': 4,                // Congelado
                'cancelado': 5,                 // Cancelado
                'cierre_extraordinario': 6      // Cierre Extraordinario
            };

            const idEstado = mapeoEstadoId[status?.toLowerCase()] || 1; // Default: Creado

            // Crear registro en historial de estado
            await EstadoSolicitudHist.create({
                fecha_cambio_estado_solicitud: new Date(),
                id_estado_solicitud: idEstado,
                id_solicitud: solicitud.id_solicitud
            }, { transaction });

            await transaction.commit();

            return { id, status, id_estado: idEstado };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Cambiar etapa de solicitud (Módulo 1, 2, 3, 4, 5)
     */
    static async cambiarEtapa(id: number, id_etapa: number) {
        const solicitud = await Solicitud.findByPk(id);
        if (!solicitud) {
            throw new Error('Solicitud no encontrada');
        }

        const etapa = await EtapaSolicitud.findByPk(id_etapa);
        if (!etapa) {
            throw new Error('Etapa no encontrada');
        }

        await solicitud.update({ id_etapa_solicitud: id_etapa });

        return { id, etapa: etapa.nombre_etapa };
    }

    /**
     * Avanzar al módulo 2 (Publicación y Candidatos)
     */
    static async avanzarAModulo2(id: number) {
        const transaction: Transaction = await sequelize.transaction();

        try {
            const solicitud = await Solicitud.findByPk(id);
            if (!solicitud) {
                throw new Error('Solicitud no encontrada');
            }

            // Buscar la etapa "Módulo 2: Publicación y Registro de Candidatos"
            console.log('🔍 Buscando etapa Módulo 2...');
            const etapaModulo2 = await EtapaSolicitud.findOne({
                where: { nombre_etapa: 'Módulo 2: Publicación y Registro de Candidatos' }
            });

            console.log('📋 Etapa encontrada:', etapaModulo2);

            if (!etapaModulo2) {
                // Intentar buscar todas las etapas para debug
                const todasLasEtapas = await EtapaSolicitud.findAll();
                console.log('📋 Todas las etapas disponibles:', todasLasEtapas.map(e => ({ id: e.id_etapa_solicitud, nombre: e.nombre_etapa })));
                throw new Error('Etapa Módulo 2 no encontrada');
            }

            // Actualizar la solicitud
            await solicitud.update({
                id_etapa_solicitud: etapaModulo2.id_etapa_solicitud 
            }, { transaction });

            // Crear entrada en el historial (usar estado por defecto: 2 = En Progreso)
            await EstadoSolicitudHist.create({
                id_solicitud: id,
                id_estado_solicitud: 2, // En Progreso
                fecha_cambio_estado_solicitud: new Date()
            }, { transaction });

            await transaction.commit();

            return { 
                success: true, 
                message: 'Proceso avanzado al Módulo 2 exitosamente',
                etapa: etapaModulo2.nombre_etapa
            };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Obtener todas las etapas disponibles
     */
    static async getEtapas() {
        const etapas = await EtapaSolicitud.findAll({
            order: [['id_etapa_solicitud', 'ASC']]
        });

        return etapas.map(etapa => ({
            id: etapa.id_etapa_solicitud,
            nombre: etapa.nombre_etapa
        }));
    }

    /**
     * Obtener todos los estados de solicitud disponibles
     */
    static async getEstadosSolicitud() {
        const estados = await EstadoSolicitud.findAll({
            order: [['id_estado_solicitud', 'ASC']]
        });

        return estados.map(estado => ({
            id: estado.id_estado_solicitud,
            nombre: estado.nombre_estado_solicitud
        }));
    }

    /**
     * Obtener estado actual de una solicitud basado en el historial
     */
    static async getEstadoActual(id: number) {
        const historialReciente = await EstadoSolicitudHist.findOne({
            where: { id_solicitud: id },
            order: [['fecha_cambio_estado_solicitud', 'DESC']],
            include: [{
                model: EstadoSolicitud,
                as: 'estado'
            }]
        });

        if (!historialReciente) {
            return null; // No hay historial, estado por defecto
        }

        const estado = historialReciente.get('estado') as any;
        return {
            id: historialReciente.id_estado_solicitud,
            nombre: estado?.nombre_estado_solicitud || 'Sin estado',
            fecha: historialReciente.fecha_cambio_estado_solicitud
        };
    }

    /**
     * Cambiar estado de solicitud por ID
     */
    static async cambiarEstado(id: number, id_estado: number) {
        const transaction: Transaction = await sequelize.transaction();

        try {
            const solicitud = await Solicitud.findByPk(id);
            if (!solicitud) {
                throw new Error('Solicitud no encontrada');
            }

            const estado = await EstadoSolicitud.findByPk(id_estado);
            if (!estado) {
                throw new Error('Estado no encontrado');
            }

            // Solo crear entrada en el historial (no actualizar solicitud)
            await EstadoSolicitudHist.create({
                id_solicitud: id,
                id_estado_solicitud: id_estado,
                fecha_cambio_estado_solicitud: new Date()
            }, { transaction });

            await transaction.commit();

            return { 
                success: true, 
                message: 'Estado cambiado exitosamente',
                estado: estado.nombre_estado_solicitud
            };
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
        const historial = solicitud.get('historialEstados') as any[];
        const estadoActual = historial?.[0]?.estado;

        // Debug log para verificar el estado
        if (solicitud.id_solicitud) {
            console.log(`🔍 Solicitud ${solicitud.id_solicitud}:`, {
                historial: historial?.length || 0,
                estadoActual: estadoActual?.nombre_estado_solicitud || 'Sin estado',
                historialCompleto: historial?.map(h => ({ 
                    id_estado: h.id_estado_solicitud, 
                    nombre: h.estado?.nombre_estado_solicitud,
                    fecha: h.fecha_cambio_estado_solicitud 
                }))
            });
        }

        return {
            // Formato completo para APIs que necesitan toda la información
            id: solicitud.id_solicitud,
            id_solicitud: solicitud.id_solicitud,
            id_descripcion_cargo: descripcionCargo?.id_descripcioncargo || 0,
            id_descripcioncargo: descripcionCargo?.id_descripcioncargo || 0,
            
            // Información básica para la tabla
            cargo: cargo?.nombre_cargo || 'Sin cargo',
            cliente: cliente?.nombre_cliente || 'Sin cliente',
            tipo_servicio: solicitud.codigo_servicio,
            tipo_servicio_nombre: tipoServicio?.nombre_servicio || solicitud.codigo_servicio,
            consultor: usuario?.nombre_usuario || 'Sin asignar',
            estado_solicitud: estadoActual?.nombre_estado_solicitud || 'Abierto',
            etapa: etapa?.nombre_etapa || 'Sin etapa',
            fecha_creacion: solicitud.fecha_ingreso_solicitud,
            datos_excel: descripcionCargo?.datos_excel || null,
            
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
            ciudad: descripcionCargo?.comuna?.nombre_comuna || '',
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
            status: this.mapEstadoToFrontend(estadoActual?.nombre_estado_solicitud),
            created_at: solicitud.fecha_ingreso_solicitud.toISOString(),
            started_at: null,
            completed_at: null,
            excel_file: descripcionCargo?.archivo_excel || undefined,
            
            // Objetos completos para acceso detallado (útil para edición)
            contacto: contacto ? {
                id_contacto: contacto.id_contacto,
                nombre_contacto: contacto.nombre_contacto,
                email_contacto: contacto.email_contacto,
                telefono_contacto: contacto.telefono_contacto,
                cargo_contacto: contacto.cargo_contacto,
                cliente: cliente ? {
                    id_cliente: cliente.id_cliente,
                    nombre_cliente: cliente.nombre_cliente
                } : null,
                comuna: contacto.comuna ? {
                    id_comuna: contacto.comuna.id_comuna,
                    nombre_comuna: contacto.comuna.nombre_comuna
                } : null
            } : null,
            descripcion_cargo: descripcionCargo ? {
                id_descripcioncargo: descripcionCargo.id_descripcioncargo,
                descripcion_cargo: descripcionCargo.descripcion_cargo,
                requisitos_y_condiciones: descripcionCargo.requisitos_y_condiciones,
                num_vacante: descripcionCargo.num_vacante,
                cargo: cargo ? {
                    id_cargo: cargo.id_cargo,
                    nombre_cargo: cargo.nombre_cargo
                } : null,
                comuna: descripcionCargo.comuna ? {
                    id_comuna: descripcionCargo.comuna.id_comuna,
                    nombre_comuna: descripcionCargo.comuna.nombre_comuna
                } : null
            } : null,
            tipo_servicio_obj: tipoServicio ? {
                codigo_servicio: tipoServicio.codigo_servicio,
                nombre_servicio: tipoServicio.nombre_servicio
            } : null,
            usuario: usuario ? {
                rut_usuario: usuario.rut_usuario,
                nombre_usuario: usuario.nombre_usuario,
                email_usuario: usuario.email_usuario
            } : null
        };
    }

    /**
     * Mapear estado del backend al frontend
     */
    private static mapEstadoToFrontend(nombreEstado?: string): string {
        if (!nombreEstado) return 'creado';

        const mapeo: { [key: string]: string } = {
            'Creado': 'creado',
            'En Progreso': 'en_progreso',
            'Cerrado': 'cerrado',
            'Congelado': 'congelado',
            'Cancelado': 'cancelado',
            'Cierre Extraordinario': 'cierre_extraordinario'
        };
        return mapeo[nombreEstado] || 'creado';
    }
}

