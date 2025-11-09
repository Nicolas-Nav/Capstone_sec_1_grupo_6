import { Transaction, Op, QueryTypes } from 'sequelize';
import sequelize from '@/config/database';
import { setDatabaseUser } from '@/utils/databaseUser';
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
    Comuna,
    Postulacion,
    EstadoClientePostulacionM5,
    PortalPostulacion,
    EstadoCliente
} from '@/models';
import { HitoSolicitudService } from './hitoSolicitudService';

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
            // Mapear el parámetro de estado a los nombres exactos en la base de datos
            const estadoMapping: { [key: string]: string } = {
                'creado': 'Creado',
                'en_progreso': 'En Progreso', 
                'cerrado': 'Cerrado',
                'congelado': 'Congelado',
                'cancelado': 'Cancelado',
                'cierre_extraordinario': 'Cierre Extraordinario'
            };

            const nombreEstadoExacto = estadoMapping[status];
            
            if (nombreEstadoExacto) {
                // Obtener todas las solicitudes con su historial de estados
                const todasLasSolicitudes = await EstadoSolicitudHist.findAll({
                    include: [
                        {
                            model: EstadoSolicitud,
                            as: 'estado',
                            attributes: ['nombre_estado_solicitud']
                        }
                    ],
                    attributes: ['id_solicitud', 'fecha_cambio_estado_solicitud'],
                    order: [['id_solicitud', 'ASC'], ['fecha_cambio_estado_solicitud', 'DESC']]
                });

                // Agrupar por solicitud y obtener el estado más reciente
                const estadoPorSolicitud = new Map<number, string>();
                todasLasSolicitudes.forEach((item: any) => {
                    if (!estadoPorSolicitud.has(item.id_solicitud)) {
                        estadoPorSolicitud.set(item.id_solicitud, item.estado.nombre_estado_solicitud);
                    }
                });

                // Filtrar solo las solicitudes que tienen el estado deseado como estado actual
                const idsConEstadoDeseado: number[] = [];
                estadoPorSolicitud.forEach((estadoActual: string, idSolicitud: number) => {
                    if (estadoActual === nombreEstadoExacto) {
                        idsConEstadoDeseado.push(idSolicitud);
                    }
                });

                // Debug log para verificar el filtro
                console.log(`🔍 Filtro por estado "${nombreEstadoExacto}":`, {
                    totalSolicitudes: estadoPorSolicitud.size,
                    idsConEstadoDeseado: idsConEstadoDeseado,
                    estadosEncontrados: Array.from(estadoPorSolicitud.entries()).slice(0, 5) // Solo los primeros 5 para debug
                });

                if (idsConEstadoDeseado.length > 0) {
                    andConditions.push({ id_solicitud: { [Op.in]: idsConEstadoDeseado } });
                } else {
                    // Si no hay solicitudes con ese estado, devolver array vacío
                    andConditions.push({ id_solicitud: { [Op.in]: [] } });
                }
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

        // Verificar y actualizar etapas para solicitudes PC con candidatos en módulo 5 (de forma asíncrona, no bloquea la respuesta)
        if (transformedSolicitudes.length > 0) {
            // Ejecutar en segundo plano sin bloquear
            Promise.all(
                transformedSolicitudes
                    .filter(s => s.tipo_servicio === 'PC')
                    .map(s => this.verificarYActualizarEtapaModulo5(s.id_solicitud, 'PC'))
            ).catch(error => {
                console.error('Error al verificar etapas módulo 5 en getSolicitudes:', error);
            });
        }

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
        const transformedSolicitudes = solicitudes.map(solicitud => this.transformSolicitud(solicitud));

        // Verificar y actualizar etapas para solicitudes PC con candidatos en módulo 5 (de forma asíncrona, no bloquea la respuesta)
        if (transformedSolicitudes.length > 0) {
            // Ejecutar en segundo plano sin bloquear
            Promise.all(
                transformedSolicitudes
                    .filter(s => s.tipo_servicio === 'PC')
                    .map(s => this.verificarYActualizarEtapaModulo5(s.id_solicitud, 'PC'))
            ).catch(error => {
                console.error('Error al verificar etapas módulo 5 en getAllSolicitudes:', error);
            });
        }

        return transformedSolicitudes;
    }

    /**
     * Verificar y actualizar etapa si hay candidatos en módulo 5
     */
    private static async verificarYActualizarEtapaModulo5(idSolicitud: number, codigoServicio: string) {
        // Solo verificar para servicios PC (Proceso Completo)
        if (codigoServicio !== 'PC') {
            return;
        }

        try {
            // Verificar si hay postulaciones con candidatos en módulo 5
            const postulaciones = await Postulacion.findAll({
                where: { id_solicitud: idSolicitud },
                attributes: ['id_postulacion']
            });

            if (postulaciones.length === 0) {
                return;
            }

            const idsPostulaciones = postulaciones.map(p => p.id_postulacion);

            // Verificar si hay alguna postulación con estado en módulo 5
            const candidatosEnModulo5 = await EstadoClientePostulacionM5.findOne({
                where: {
                    id_postulacion: { [Op.in]: idsPostulaciones }
                }
            });

            if (candidatosEnModulo5) {
                // Buscar la etapa "Módulo 5: Seguimiento Posterior a la Evaluación Psicolaboral"
                const etapaModulo5 = await EtapaSolicitud.findOne({
                    where: { nombre_etapa: 'Módulo 5: Seguimiento Posterior a la Evaluación Psicolaboral' }
                });

                if (etapaModulo5) {
                    const solicitud = await Solicitud.findByPk(idSolicitud);
                    if (solicitud && solicitud.id_etapa_solicitud !== etapaModulo5.id_etapa_solicitud) {
                        // Actualizar la etapa solo si es diferente
                        await solicitud.update({
                            id_etapa_solicitud: etapaModulo5.id_etapa_solicitud
                        });
                        console.log(`✅ Etapa actualizada automáticamente a Módulo 5 para solicitud ${idSolicitud}`);
                    }
                }
            }
        } catch (error) {
            console.error('Error al verificar/actualizar etapa módulo 5:', error);
            // No lanzar error, solo registrar
        }
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

        // Verificar y actualizar etapa si hay candidatos en módulo 5
        await this.verificarYActualizarEtapaModulo5(id, solicitud.codigo_servicio);

        // Recargar la solicitud para obtener la etapa actualizada
        const solicitudActualizada = await Solicitud.findByPk(id, {
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

        return this.transformSolicitud(solicitudActualizada);
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
    }, usuarioRut?: string) {
        const transaction: Transaction = await sequelize.transaction();

        try {
            // Establecer el usuario en la transacción para los triggers de auditoría
            if (usuarioRut) {
                await setDatabaseUser(usuarioRut, transaction);
            }

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

            // Todos los procesos inician en Módulo 1
            // ES, TS y AP usan módulos 1 y 4 (pero inician en 1)
            // Los demás servicios usan los módulos según su configuración
            const idEtapaInicial = 1;

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

            // Crear hitos automáticamente basados en las plantillas del servicio
            try {
                await HitoSolicitudService.copiarPlantillasASolicitud(nuevaSolicitud.id_solicitud);
                
                // Activar hitos de "inicio_proceso" inmediatamente
                await HitoSolicitudService.activarHitosPorEvento(
                    nuevaSolicitud.id_solicitud,
                    'inicio_proceso',
                    new Date()
                );
                
                console.log(`✅ Hitos creados y activados para solicitud ${nuevaSolicitud.id_solicitud}`);
            } catch (hitoError) {
                // Log del error pero no fallar la creación de solicitud
                console.warn(`⚠️  Advertencia: No se pudieron crear hitos para la solicitud ${nuevaSolicitud.id_solicitud}:`, hitoError);
                // Los hitos se pueden crear manualmente después si es necesario
            }

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
    }, usuarioRut?: string) {
        const transaction: Transaction = await sequelize.transaction();

        try {
            // Establecer el usuario en la transacción para los triggers de auditoría
            if (usuarioRut) {
                await setDatabaseUser(usuarioRut, transaction);
            }

            const solicitud = await Solicitud.findByPk(id, {
                include: [{ model: DescripcionCargo, as: 'descripcionCargo' }],
                transaction
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
    static async updateEstado(id: number, data: { status: string; reason?: string }, usuarioRut?: string) {
        const transaction: Transaction = await sequelize.transaction();

        try {
            // Establecer el usuario en la transacción para los triggers de auditoría
            if (usuarioRut) {
                await setDatabaseUser(usuarioRut, transaction);
            }

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
    static async cambiarEtapa(id: number, id_etapa: number, usuarioRut?: string) {
        const transaction = await sequelize.transaction();

        try {
            // Establecer el usuario en la transacción para los triggers de auditoría
            if (usuarioRut) {
                await setDatabaseUser(usuarioRut, transaction);
            }

            const solicitud = await Solicitud.findByPk(id, { transaction });
            if (!solicitud) {
                throw new Error('Solicitud no encontrada');
            }

            const etapa = await EtapaSolicitud.findByPk(id_etapa);
            if (!etapa) {
                throw new Error('Etapa no encontrada');
            }

            await solicitud.update({ id_etapa_solicitud: id_etapa }, { transaction });
            await transaction.commit();

            return { id, etapa: etapa.nombre_etapa };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Avanzar al módulo 2 (Publicación y Candidatos)
     */
    static async avanzarAModulo2(id: number, usuarioRut?: string) {
        const transaction: Transaction = await sequelize.transaction();

        try {
            // Establecer el usuario en la transacción para los triggers de auditoría
            if (usuarioRut) {
                await setDatabaseUser(usuarioRut, transaction);
            }

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

            // Activar hitos relacionados con la publicación (Módulo 2)
            try {
                await HitoSolicitudService.activarHitosPorEvento(
                    id,
                    'publicacion',
                    new Date()
                );
                console.log(`✅ Hitos de publicación activados para solicitud ${id}`);
            } catch (hitoError) {
                console.warn(`⚠️  Advertencia: No se pudieron activar hitos de publicación para la solicitud ${id}:`, hitoError);
            }

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
     * Avanzar al módulo 3 (Presentación de Candidatos)
     */
    static async avanzarAModulo3(id: number) {
        const transaction: Transaction = await sequelize.transaction();

        try {
            const solicitud = await Solicitud.findByPk(id);
            if (!solicitud) {
                throw new Error('Solicitud no encontrada');
            }

            // Buscar la etapa "Módulo 3: Presentación de Candidatos"
            console.log('🔍 Buscando etapa Módulo 3...');
            const etapaModulo3 = await EtapaSolicitud.findOne({
                where: { nombre_etapa: 'Módulo 3: Presentación de Candidatos' }
            });

            console.log('📋 Etapa encontrada:', etapaModulo3);

            if (!etapaModulo3) {
                // Intentar buscar todas las etapas para debug
                const todasLasEtapas = await EtapaSolicitud.findAll();
                console.log('📋 Todas las etapas disponibles:', todasLasEtapas.map(e => ({ id: e.id_etapa_solicitud, nombre: e.nombre_etapa })));
                throw new Error('Etapa Módulo 3 no encontrada');
            }

            // Actualizar la solicitud
            await solicitud.update({
                id_etapa_solicitud: etapaModulo3.id_etapa_solicitud 
            }, { transaction });

            // Crear entrada en el historial (usar estado por defecto: 2 = En Progreso)
            await EstadoSolicitudHist.create({
                id_solicitud: id,
                id_estado_solicitud: 2, // En Progreso
                fecha_cambio_estado_solicitud: new Date()
            }, { transaction });

            await transaction.commit();

            // Activar hitos relacionados con la primera presentación (Módulo 3)
            try {
                await HitoSolicitudService.activarHitosPorEvento(
                    id,
                    'primera_presentacion',
                    new Date()
                );
                console.log(`✅ Hitos de primera presentación activados para solicitud ${id}`);
            } catch (hitoError) {
                console.warn(`⚠️  Advertencia: No se pudieron activar hitos de primera presentación para la solicitud ${id}:`, hitoError);
            }

            return { 
                success: true, 
                message: 'Proceso avanzado al Módulo 3 exitosamente',
                etapa: etapaModulo3.nombre_etapa
            };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Avanzar al Módulo 4 (Evaluación Psicolaboral)
     */
    static async avanzarAModulo4(id: number) {
        const transaction = await sequelize.transaction();

        try {

            const solicitud = await Solicitud.findByPk(id);
            if (!solicitud) {
                throw new Error('Solicitud no encontrada');
            }

            // Buscar la etapa "Módulo 4: Evaluación Psicolaboral"
            console.log('🔍 Buscando etapa Módulo 4...');
            const etapaModulo4 = await EtapaSolicitud.findOne({
                where: { nombre_etapa: 'Módulo 4: Evaluación Psicolaboral' }
            });

            console.log('📋 Etapa encontrada:', etapaModulo4);

            if (!etapaModulo4) {
                // Intentar buscar todas las etapas para debug
                const todasLasEtapas = await EtapaSolicitud.findAll();
                console.log('📋 Todas las etapas disponibles:', todasLasEtapas.map(e => ({ id: e.id_etapa_solicitud, nombre: e.nombre_etapa })));
                throw new Error('Etapa Módulo 4 no encontrada');
            }

            // Actualizar la solicitud
            await solicitud.update({
                id_etapa_solicitud: etapaModulo4.id_etapa_solicitud 
            }, { transaction });

            await transaction.commit();

            // Activar hitos relacionados con la evaluación psicolaboral (Módulo 4)
            try {
                await HitoSolicitudService.activarHitosPorEvento(
                    id,
                    'evaluacion_psicolaboral',
                    new Date()
                );
                console.log(`✅ Hitos de evaluación psicolaboral activados para solicitud ${id}`);
            } catch (hitoError) {
                console.warn(`⚠️  Advertencia: No se pudieron activar hitos de evaluación psicolaboral para la solicitud ${id}:`, hitoError);
            }

            console.log('✅ Proceso avanzado al Módulo 4 exitosamente');
            console.log('📋 Nueva etapa:', etapaModulo4.nombre_etapa);

            return { 
                success: true, 
                message: 'Proceso avanzado al Módulo 4 exitosamente',
                etapa: etapaModulo4.nombre_etapa
            };
        } catch (error) {
            await transaction.rollback();
            console.error('❌ Error al avanzar al Módulo 4:', error);
            throw error;
        }
    }

    /**
     * Avanzar al Módulo 5 (Seguimiento Posterior a la Evaluación Psicolaboral)
     */
    static async avanzarAModulo5(id: number) {
        const transaction = await sequelize.transaction();

        try {
            const solicitud = await Solicitud.findByPk(id);
            if (!solicitud) {
                throw new Error('Solicitud no encontrada');
            }

            // Buscar la etapa "Módulo 5: Seguimiento Posterior a la Evaluación Psicolaboral"
            console.log('🔍 Buscando etapa Módulo 5...');
            const etapaModulo5 = await EtapaSolicitud.findOne({
                where: { nombre_etapa: 'Módulo 5: Seguimiento Posterior a la Evaluación Psicolaboral' }
            });

            console.log('📋 Etapa encontrada:', etapaModulo5);

            if (!etapaModulo5) {
                // Intentar buscar todas las etapas para debug
                const todasLasEtapas = await EtapaSolicitud.findAll();
                console.log('📋 Todas las etapas disponibles:', todasLasEtapas.map(e => ({ id: e.id_etapa_solicitud, nombre: e.nombre_etapa })));
                throw new Error('Etapa Módulo 5 no encontrada');
            }

            // Actualizar la solicitud
            await solicitud.update({
                id_etapa_solicitud: etapaModulo5.id_etapa_solicitud 
            }, { transaction });

            await transaction.commit();

            console.log('✅ Proceso avanzado al Módulo 5 exitosamente');
            console.log('📋 Nueva etapa:', etapaModulo5.nombre_etapa);

            return { 
                success: true, 
                message: 'Proceso avanzado al Módulo 5 exitosamente',
                etapa: etapaModulo5.nombre_etapa
            };
        } catch (error) {
            await transaction.rollback();
            console.error('❌ Error al avanzar al Módulo 5:', error);
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
    static async cambiarEstado(id: number, id_estado: number, reason?: string, usuarioRut?: string) {
        const transaction: Transaction = await sequelize.transaction();

        try {
            // Establecer el usuario en la transacción para los triggers de auditoría
            if (usuarioRut) {
                await setDatabaseUser(usuarioRut, transaction);
            }
            
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
                fecha_cambio_estado_solicitud: new Date(),
                comentario_estado_solicitud_hist: reason || null
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
    static async deleteSolicitud(id: number, usuarioRut?: string) {
        const transaction: Transaction = await sequelize.transaction();

        try {
            // Establecer el usuario en la transacción para los triggers de auditoría
            if (usuarioRut) {
                await setDatabaseUser(usuarioRut, transaction);
            }
            
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

    /**
     * Obtener procesos activos agrupados por consultor (OPTIMIZADO)
     * Retorna un objeto con el nombre del consultor como clave y la cantidad de procesos activos como valor
     * Usa query SQL directa para máximo rendimiento
     */
    static async getActiveProcessesByConsultant(): Promise<Record<string, number>> {
        try {
            // Query SQL optimizada: solo trae lo necesario
            // Usa CTE para obtener el estado más reciente de cada solicitud y filtra solo activos
            const [results] = await sequelize.query(`
                WITH estado_actual AS (
                    SELECT DISTINCT ON (esh.id_solicitud)
                        esh.id_solicitud,
                        es.nombre_estado_solicitud
                    FROM estado_solicitud_hist esh
                    INNER JOIN estado es ON esh.id_estado_solicitud = es.id_estado_solicitud
                    WHERE es.nombre_estado_solicitud IN ('En Progreso', 'Iniciado', 'Abierto')
                    ORDER BY esh.id_solicitud, esh.fecha_cambio_estado_solicitud DESC
                )
                SELECT 
                    COALESCE(u.nombre_usuario, 'Sin asignar') as consultor,
                    COUNT(*) as cantidad
                FROM solicitud s
                INNER JOIN estado_actual ea ON s.id_solicitud = ea.id_solicitud
                LEFT JOIN usuario u ON s.rut_usuario = u.rut_usuario
                WHERE s.rut_usuario IS NOT NULL
                GROUP BY u.nombre_usuario
                ORDER BY cantidad DESC
            `);

            // Convertir resultados a objeto Record<string, number>
            const resultado: Record<string, number> = {};
            (results as any[]).forEach((row: any) => {
                const consultor = row.consultor || 'Sin asignar';
                resultado[consultor] = parseInt(row.cantidad) || 0;
            });

            return resultado;
        } catch (error: any) {
            console.error('Error al obtener procesos activos por consultor:', error);
            throw new Error('Error al obtener procesos activos por consultor');
        }
    }

    /**
     * Obtener distribución de procesos por tipo de servicio (OPTIMIZADO)
     * Retorna un array con servicio, cantidad y porcentaje
     * Usa query optimizada que solo trae los campos necesarios
     * Trae TODAS las solicitudes sin filtros (de todos los consultores y estados)
     */
    static async getProcessesByServiceType(): Promise<Array<{ service: string; count: number; percentage: number }>> {
        try {
            // Query optimizada: solo trae codigo_servicio y el nombre del tipo de servicio
            // Usa required: false para hacer LEFT JOIN y traer todas las solicitudes
            const solicitudes = await Solicitud.findAll({
                attributes: ['codigo_servicio'],
                include: [
                    {
                        model: TipoServicio,
                        as: 'tipoServicio',
                        attributes: ['nombre_servicio'], // Columna correcta: nombre_servicio, no nombre_tipo_servicio
                        required: false // LEFT JOIN para traer todas las solicitudes incluso sin tipo de servicio
                    }
                ],
                raw: false,
                // Sin filtros: trae TODAS las solicitudes
            });

            console.log(`[DEBUG] Total de solicitudes encontradas: ${solicitudes.length}`);

            // Contar por tipo de servicio
            const serviceTypeCounts: Record<string, number> = {};
            let total = 0;
            const codigosNoMapeados: Record<string, number> = {};

            solicitudes.forEach((solicitud: any) => {
                const codigoServicio = solicitud.codigo_servicio || 'sin_servicio';
                const nombreServicio = solicitud.tipoServicio?.nombre_servicio || codigoServicio; // Columna correcta: nombre_servicio

                // Mapeo de códigos a nombres legibles
                const serviceMapping: Record<string, string> = {
                    'PC': 'Proceso Completo',
                    'LL': 'Long List',
                    'TR': 'Targeted Recruitment',
                    'HS': 'Headhunting',
                    'ES': 'Evaluación Psicolaboral',
                    'TS': 'Test Psicolaboral',
                    'AO': 'Filtro Inteligente',
                };

                const serviceLabel = serviceMapping[codigoServicio] || nombreServicio;
                
                // Registrar códigos no mapeados
                if (!serviceMapping[codigoServicio] && codigoServicio !== 'sin_servicio') {
                    codigosNoMapeados[codigoServicio] = (codigosNoMapeados[codigoServicio] || 0) + 1;
                }

                serviceTypeCounts[serviceLabel] = (serviceTypeCounts[serviceLabel] || 0) + 1;
                total++;
            });

            console.log(`[DEBUG] Distribución por tipo de servicio:`, serviceTypeCounts);
            console.log(`[DEBUG] Total de procesos contados: ${total}`);
            if (Object.keys(codigosNoMapeados).length > 0) {
                console.log(`[DEBUG] Códigos de servicio no mapeados encontrados:`, codigosNoMapeados);
            }

            // Convertir a array con porcentajes
            return Object.entries(serviceTypeCounts).map(([service, count]) => ({
                service,
                count,
                percentage: total > 0 ? Math.round((count / total) * 100) : 0,
            }));
        } catch (error: any) {
            console.error('Error al obtener distribución por tipo de servicio:', error);
            throw new Error('Error al obtener distribución por tipo de servicio');
        }
    }

    /**
     * Obtener distribución de candidatos por fuente (portal de postulación)
     * Retorna un array con fuente, cantidad total de candidatos y cantidad de contratados
     * Usa query optimizada que solo trae los campos necesarios
     */
    static async getCandidateSourceData(): Promise<Array<{ source: string; candidates: number; hired: number }>> {
        try {
            // Query optimizada usando SQL directo para mejor rendimiento
            // Contratados: solo aquellos con contratacion donde id_estado_contratacion = 1
            const [results] = await sequelize.query(`
                SELECT 
                    COALESCE(pp.nombre_portal_postulacion, 'Sin fuente') as source,
                    COUNT(DISTINCT p.id_postulacion) as candidates,
                    COUNT(DISTINCT CASE 
                        WHEN c.id_estado_contratacion = 1 THEN p.id_postulacion 
                        ELSE NULL 
                    END) as hired
                FROM postulacion p
                LEFT JOIN portal_postulacion pp ON p.id_portal_postulacion = pp.id_portal_postulacion
                LEFT JOIN contratacion c ON p.id_postulacion = c.id_postulacion
                GROUP BY pp.nombre_portal_postulacion
                ORDER BY candidates DESC
            `);

            console.log(`[DEBUG] Fuentes de candidatos encontradas:`, (results as any[]).length);

            // Convertir resultados a formato esperado
            return (results as any[]).map((row: any) => ({
                source: row.source || 'Sin fuente',
                candidates: parseInt(row.candidates) || 0,
                hired: parseInt(row.hired) || 0
            }));
        } catch (error: any) {
            console.error('Error al obtener fuentes de candidatos:', error);
            throw new Error('Error al obtener fuentes de candidatos');
        }
    }

    /**
     * Obtener estadísticas generales de procesos
     * Retorna: procesos activos, tiempo promedio de contratación, total de candidatos
     */
    static async getProcessStats(): Promise<{ activeProcesses: number; avgTimeToHire: number; totalCandidates: number }> {
        try {
            // 1. Procesos activos: contar solicitudes con estado más reciente = 1 o 2 (Iniciado/En Progreso)
            const [activeResult] = await sequelize.query(`
                WITH ult AS (
                    SELECT
                        id_solicitud,
                        id_estado_solicitud,
                        ROW_NUMBER() OVER (
                            PARTITION BY id_solicitud
                            ORDER BY fecha_cambio_estado_solicitud DESC
                        ) AS rn
                    FROM estado_solicitud_hist
                )
                SELECT COUNT(*) as activos
                FROM ult
                WHERE rn = 1
                  AND id_estado_solicitud IN (1, 2)
            `);
            const activeProcesses = parseInt((activeResult[0] as any)?.activos || '0');

            // 2. Tiempo promedio de contratación: calcular desde fecha_ingreso_solicitud hasta fecha_ingreso_contratacion
            const [timeResult] = await sequelize.query(`
                SELECT 
                    AVG(
                        EXTRACT(EPOCH FROM (c.fecha_ingreso_contratacion - s.fecha_ingreso_solicitud)) / 86400
                    ) as avg_days
                FROM contratacion c
                INNER JOIN postulacion p ON c.id_postulacion = p.id_postulacion
                INNER JOIN solicitud s ON p.id_solicitud = s.id_solicitud
                WHERE c.id_estado_contratacion = 1
                  AND c.fecha_ingreso_contratacion IS NOT NULL
                  AND s.fecha_ingreso_solicitud IS NOT NULL
            `);
            const avgDays = parseFloat((timeResult[0] as any)?.avg_days || '0');
            const avgTimeToHire = Math.round(avgDays) || 0;

            // 3. Total de candidatos: contar todas las postulaciones
            const [candidatesResult] = await sequelize.query(`
                SELECT COUNT(*) as total
                FROM postulacion
            `);
            const totalCandidates = parseInt((candidatesResult[0] as any)?.total || '0');

            console.log(`[DEBUG] Estadísticas: Activos=${activeProcesses}, TiempoPromedio=${avgTimeToHire}, Candidatos=${totalCandidates}`);

            return {
                activeProcesses,
                avgTimeToHire,
                totalCandidates
            };
        } catch (error: any) {
            console.error('Error al obtener estadísticas de procesos:', error);
            throw new Error('Error al obtener estadísticas de procesos');
        }
    }

    /**
     * Obtener distribución de estados de procesos para un período específico
     * @param year Año del período
     * @param month Mes del período (0-11, donde 0 = enero)
     * @param week Semana del mes (opcional, 1-5)
     * @param periodType Tipo de período: 'week', 'month', 'quarter'
     */
    static async getProcessStatusDistribution(
        year: number, 
        month: number, 
        week?: number, 
        periodType: 'week' | 'month' | 'quarter' = 'month'
    ): Promise<Array<{ status: string; count: number }>> {
        try {
            let startDate: Date
            let endDate: Date

            if (periodType === 'week' && week) {
                // Calcular fechas de la semana específica
                const firstDayOfMonth = new Date(year, month, 1)
                const dayOfWeek = firstDayOfMonth.getDay()
                const daysToMonday = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 0 : (8 - dayOfWeek)
                const firstMonday = new Date(year, month, 1 + daysToMonday)
                
                // Avanzar a la semana solicitada (semana 1 = primer lunes, semana 2 = segundo lunes, etc.)
                const weekStart = new Date(firstMonday)
                weekStart.setDate(weekStart.getDate() + (week - 1) * 7)
                
                startDate = new Date(weekStart)
                startDate.setHours(0, 0, 0, 0)
                
                endDate = new Date(weekStart)
                endDate.setDate(endDate.getDate() + 6)
                endDate.setHours(23, 59, 59, 999)
                
                // Si la semana termina fuera del mes, ajustar al último día del mes
                const lastDayOfMonth = new Date(year, month + 1, 0)
                if (endDate > lastDayOfMonth) {
                    endDate = lastDayOfMonth
                    endDate.setHours(23, 59, 59, 999)
                }
            } else if (periodType === 'month') {
                // Todo el mes
                startDate = new Date(year, month, 1)
                startDate.setHours(0, 0, 0, 0)
                endDate = new Date(year, month + 1, 0)
                endDate.setHours(23, 59, 59, 999)
            } else {
                // Quarter (trimestre)
                const quarterStartMonth = Math.floor(month / 3) * 3
                startDate = new Date(year, quarterStartMonth, 1)
                startDate.setHours(0, 0, 0, 0)
                endDate = new Date(year, quarterStartMonth + 3, 0)
                endDate.setHours(23, 59, 59, 999)
            }

            // Query para obtener distribución de estados
            // Filtrar solicitudes creadas en el período y obtener su estado más reciente
            console.log(`[DEBUG] Fechas de búsqueda: ${startDate.toISOString()} a ${endDate.toISOString()}`);
            
            const results = (await sequelize.query(`
                WITH estado_actual AS (
                    SELECT DISTINCT ON (esh.id_solicitud)
                        esh.id_solicitud,
                        es.id_estado_solicitud,
                        es.nombre_estado_solicitud
                    FROM estado_solicitud_hist esh
                    INNER JOIN estado es ON esh.id_estado_solicitud = es.id_estado_solicitud
                    ORDER BY esh.id_solicitud, esh.fecha_cambio_estado_solicitud DESC
                )
                SELECT 
                    ea.nombre_estado_solicitud as status,
                    COUNT(*) as count
                FROM solicitud s
                INNER JOIN estado_actual ea ON s.id_solicitud = ea.id_solicitud
                WHERE s.fecha_ingreso_solicitud >= :startDate
                  AND s.fecha_ingreso_solicitud <= :endDate
                GROUP BY ea.nombre_estado_solicitud
                ORDER BY count DESC
            `, {
                replacements: {
                    startDate: startDate,
                    endDate: endDate
                },
                type: QueryTypes.SELECT
            })) as Array<{ status?: string; count?: number }>;

            console.log(`[DEBUG] Distribución de estados para período ${periodType}:`, {
                year,
                month,
                week,
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0],
                totalResults: results.length,
                results: results
            });

            // Mapeo de nombres de estados a los que se muestran en el frontend
            const statusMapping: Record<string, string> = {
                'Creado': 'Iniciado',
                'En Progreso': 'En Progreso',
                'Cerrado': 'Completado',
                'Congelado': 'Pausado',
                'Cancelado': 'Cancelado',
            };

            // Convertir resultados a formato esperado
            const mappedResults = results.map((row) => {
                const dbStatus = row.status || 'Desconocido';
                const frontendStatus = statusMapping[dbStatus] || dbStatus;
                console.log(`[DEBUG] Mapeando estado: ${dbStatus} -> ${frontendStatus}, count: ${row.count}`);
                return {
                    status: frontendStatus,
                    count: parseInt(String(row.count ?? '0')) || 0
                };
            });

            console.log(`[DEBUG] Resultados mapeados:`, mappedResults);
            return mappedResults;
        } catch (error: any) {
            console.error('Error al obtener distribución de estados:', error);
            throw new Error('Error al obtener distribución de estados');
        }
    }
}

