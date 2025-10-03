import { Transaction } from 'sequelize';
import sequelize from '@/config/database';
import {
    Postulacion,
    Candidato,
    EstadoCandidato,
    Solicitud,
    PortalPostulacion,
    Experiencia,
    Profesion,
    PostgradoCapacitacion,
    CandidatoPostgradoCapacitacion,
    Institucion,
    EstadoClientePostulacion,
    EstadoCliente,
    Comuna
} from '@/models';

/**
 * Servicio para gestión de Postulaciones
 * Contiene toda la lógica de negocio relacionada con postulaciones y candidatos
 */

export class PostulacionService {
    /**
     * Obtener postulaciones por solicitud
     */
    static async getPostulacionesBySolicitud(idSolicitud: number) {
        const postulaciones = await Postulacion.findAll({
            where: { id_solicitud: idSolicitud },
            include: [
                {
                    model: Candidato,
                    as: 'candidato',
                    include: [
                        {
                            model: Comuna,
                            as: 'comuna',
                            attributes: ['id_comuna', 'nombre_comuna']
                        },
                        {
                            model: Experiencia,
                            as: 'experiencias'
                        },
                        {
                            model: Profesion,
                            as: 'profesiones',
                            through: { attributes: [] }
                        },
                        {
                            model: PostgradoCapacitacion,
                            as: 'postgradosCapacitaciones',
                            through: { attributes: [] },
                            include: [
                                {
                                    model: Institucion,
                                    as: 'institucion'
                                }
                            ]
                        }
                    ]
                },
                {
                    model: EstadoCandidato,
                    as: 'estadoCandidato'
                },
                {
                    model: PortalPostulacion,
                    as: 'portalPostulacion'
                },
                {
                    model: EstadoClientePostulacion,
                    as: 'estadosCliente',
                    include: [
                        {
                            model: EstadoCliente,
                            as: 'estadoCliente'
                        }
                    ]
                }
            ],
            order: [['id_postulacion', 'DESC']]
        });

        return postulaciones.map(postulacion => this.transformPostulacion(postulacion));
    }

    /**
     * Crear nueva postulación
     */
    static async createPostulacion(data: {
        process_id: number;
        name: string;
        email: string;
        phone: string;
        birth_date?: string;
        comuna?: string;
        profession?: string;
        source_portal?: string;
        consultant_rating?: number;
        consultant_comment?: string;
        motivation?: string;
        salary_expectation?: number;
        availability?: string;
        family_situation?: string;
        english_level?: string;
        software_tools?: string;
        has_disability_credential?: boolean;
        work_experience?: any[];
        education?: any[];
    }) {
        const transaction: Transaction = await sequelize.transaction();

        try {
            const {
                process_id,
                name,
                email,
                phone,
                birth_date,
                comuna,
                profession,
                source_portal,
                consultant_rating,
                consultant_comment,
                motivation,
                salary_expectation,
                availability,
                family_situation,
                english_level,
                software_tools,
                has_disability_credential,
                work_experience = [],
                education = []
            } = data;

            // Validaciones
            if (!process_id || !name || !email || !phone) {
                throw new Error('Faltan campos requeridos');
            }

            // Separar nombre en partes
            const nombrePartes = name.trim().split(' ');
            const nombre = nombrePartes[0];
            const primerApellido = nombrePartes[1] || '';
            const segundoApellido = nombrePartes.slice(2).join(' ') || '';

            // Verificar que existe la solicitud
            const solicitud = await Solicitud.findByPk(process_id);
            if (!solicitud) {
                throw new Error('Solicitud no encontrada');
            }

            // Buscar comuna por nombre
            let idComuna: number | undefined = undefined;
            if (comuna && comuna.trim()) {
                const comunaFound = await Comuna.findOne({
                    where: { nombre_comuna: comuna.trim() }
                });
                idComuna = comunaFound?.id_comuna;
            }

            if (!idComuna) {
                const comunaDefecto = await Comuna.findOne({
                    where: { nombre_comuna: 'Santiago' }
                });
                idComuna = comunaDefecto?.id_comuna;
            }

            // Buscar o crear candidato
            let candidato = await Candidato.findOne({
                where: { email_candidato: email.trim() }
            });

            if (!candidato) {
                candidato = await Candidato.create({
                    nombre_candidato: nombre,
                    primer_apellido_candidato: primerApellido,
                    segundo_apellido_candidato: segundoApellido,
                    telefono_candidato: phone.trim(),
                    email_candidato: email.trim(),
                    fecha_nacimiento_candidato: birth_date ? new Date(birth_date) : undefined,
                    edad_candidato: birth_date ? this.calculateAge(new Date(birth_date)) : undefined,
                    nivel_ingles: english_level,
                    software_herramientas: software_tools,
                    discapacidad: has_disability_credential || false,
                    id_comuna: idComuna
                }, { transaction });

                // Agregar experiencias laborales
                for (const exp of work_experience) {
                    await Experiencia.create({
                        empresa: exp.company,
                        cargo: exp.position,
                        fecha_inicio_experiencia: exp.start_date ? new Date(exp.start_date) : new Date(),
                        fecha_fin_experiencia: exp.end_date ? new Date(exp.end_date) : undefined,
                        descripcion_funciones_experiencia: exp.description || '',
                        id_candidato: candidato.id_candidato
                    }, { transaction });
                }

                // Agregar formación académica
                for (const edu of education) {
                    let institucion = await Institucion.findOne({
                        where: { nombre_institucion: edu.institution }
                    });

                    if (!institucion) {
                        institucion = await Institucion.create({
                            nombre_institucion: edu.institution
                        }, { transaction });
                    }

                    const formacion = await PostgradoCapacitacion.create({
                        nombre_postgradocapacitacion: edu.title,
                        id_institucion: institucion.id_institucion
                    }, { transaction });

                    await CandidatoPostgradoCapacitacion.create({
                        id_candidato: candidato.id_candidato,
                        id_postgradocapacitacion: formacion.id_postgradocapacitacion
                    }, { transaction });
                }
            }

            // Buscar portal de postulación
            let portal = await PortalPostulacion.findOne({
                where: { nombre_portal_postulacion: source_portal }
            });

            if (!portal) {
                portal = await PortalPostulacion.create({
                    nombre_portal_postulacion: source_portal || 'Directo'
                }, { transaction });
            }

            // Buscar estado inicial
            const estadoInicial = await EstadoCandidato.findOne({
                where: { nombre_estado_candidato: 'Postulado' }
            });

            if (!estadoInicial) {
                throw new Error('Estado inicial no encontrado');
            }

            // Crear postulación
            const nuevaPostulacion = await Postulacion.create({
                motivacion: motivation,
                expectativa_renta: salary_expectation ? Number(salary_expectation) : undefined,
                disponibilidad_postulacion: availability,
                situacion_familiar: family_situation,
                valoracion: consultant_rating || 3,
                comentario_no_presentado: consultant_comment,
                id_candidato: candidato.id_candidato,
                id_estado_candidato: estadoInicial.id_estado_candidato,
                id_solicitud: process_id,
                id_portal_postulacion: portal.id_portal_postulacion
            }, { transaction });

            await transaction.commit();

            return {
                id: nuevaPostulacion.id_postulacion,
                candidato_id: candidato.id_candidato
            };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Actualizar estado de postulación
     */
    static async updateEstado(id: number, data: { presentation_status: string; rejection_reason?: string }) {
        const transaction: Transaction = await sequelize.transaction();

        try {
            const { presentation_status, rejection_reason } = data;

            const postulacion = await Postulacion.findByPk(id);
            if (!postulacion) {
                throw new Error('Postulación no encontrada');
            }

            // Mapear estado
            let nombreEstado = 'Postulado';
            if (presentation_status === 'presentado') {
                nombreEstado = 'Presentado';
            } else if (presentation_status === 'no_presentado') {
                nombreEstado = 'No Presentado';
            } else if (presentation_status === 'rechazado') {
                nombreEstado = 'Rechazado';
            }

            const nuevoEstado = await EstadoCandidato.findOne({
                where: { nombre_estado_candidato: nombreEstado }
            });

            if (!nuevoEstado) {
                throw new Error('Estado no válido');
            }

            await postulacion.update({
                id_estado_candidato: nuevoEstado.id_estado_candidato,
                comentario_no_presentado: rejection_reason || postulacion.comentario_no_presentado
            }, { transaction });

            await transaction.commit();

            return { id };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Actualizar valoración
     */
    static async updateValoracion(id: number, rating: number) {
        if (rating < 1 || rating > 5) {
            throw new Error('La valoración debe estar entre 1 y 5');
        }

        const postulacion = await Postulacion.findByPk(id);
        if (!postulacion) {
            throw new Error('Postulación no encontrada');
        }

        await postulacion.update({ valoracion: rating });

        return { id, rating };
    }

    /**
     * Eliminar postulación
     */
    static async deletePostulacion(id: number) {
        const transaction: Transaction = await sequelize.transaction();

        try {
            const postulacion = await Postulacion.findByPk(id);
            if (!postulacion) {
                throw new Error('Postulación no encontrada');
            }

            await postulacion.destroy({ transaction });
            await transaction.commit();

            return { id };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Transformar postulación a formato frontend
     */
    private static transformPostulacion(postulacion: any) {
        const candidato = postulacion.get('candidato') as any;
        const estado = postulacion.get('estadoCandidato') as any;
        const portal = postulacion.get('portalPostulacion') as any;

        return {
            id: candidato.id_candidato.toString(),
            process_id: postulacion.id_solicitud.toString(),
            name: candidato.getNombreCompleto(),
            email: candidato.email_candidato,
            phone: candidato.telefono_candidato,
            rut: candidato.rut_candidato || undefined,
            cv_file: postulacion.tieneCV() ? 'cv.pdf' : undefined,
            motivation: postulacion.motivacion,
            salary_expectation: postulacion.expectativa_renta ? Number(postulacion.expectativa_renta) : undefined,
            availability: postulacion.disponibilidad_postulacion,
            source_portal: portal?.nombre_portal_postulacion || '',
            consultant_rating: postulacion.valoracion || 3,
            status: this.mapEstadoToFrontend(estado?.nombre_estado_candidato),
            created_at: new Date().toISOString(),
            birth_date: candidato.fecha_nacimiento_candidato?.toISOString().split('T')[0],
            age: candidato.edad_candidato,
            comuna: candidato.comuna?.nombre_comuna || '',
            profession: candidato.profesiones?.[0]?.nombre_profesion || '',
            consultant_comment: postulacion.comentario_no_presentado,
            presentation_status: this.mapPresentationStatus(estado?.nombre_estado_candidato),
            rejection_reason: postulacion.comentario_rech_obs_cliente,
            has_disability_credential: candidato.discapacidad,
            work_experience: candidato.experiencias?.map((exp: any) => ({
                id: exp.id_experiencia.toString(),
                company: exp.empresa,
                position: exp.cargo,
                start_date: exp.fecha_inicio_experiencia?.toISOString().split('T')[0] || '',
                end_date: exp.fecha_fin_experiencia?.toISOString().split('T')[0] || '',
                is_current: !exp.fecha_fin_experiencia,
                description: exp.descripcion_funciones_experiencia,
                comments: '',
                exit_reason: ''
            })) || [],
            education: candidato.postgradosCapacitaciones?.map((edu: any) => ({
                id: edu.id_postgradocapacitacion.toString(),
                type: 'postgrado',
                institution: edu.institucion?.nombre_institucion || '',
                title: edu.nombre_postgradocapacitacion,
                start_date: '',
                completion_date: '',
                observations: ''
            })) || [],
            portal_responses: {
                motivation: postulacion.motivacion,
                salary_expectation: postulacion.expectativa_renta?.toString(),
                availability: postulacion.disponibilidad_postulacion,
                family_situation: postulacion.situacion_familiar,
                rating: postulacion.valoracion || 3,
                english_level: candidato.nivel_ingles,
                has_driving_license: false,
                software_tools: candidato.software_herramientas
            }
        };
    }

    /**
     * Helpers
     */
    private static mapEstadoToFrontend(nombreEstado?: string): string {
        const mapeo: { [key: string]: string } = {
            'Postulado': 'postulado',
            'Presentado': 'presentado',
            'Aprobado': 'aprobado',
            'Rechazado': 'rechazado',
            'Contratado': 'contratado'
        };
        return mapeo[nombreEstado || ''] || 'postulado';
    }

    private static mapPresentationStatus(nombreEstado?: string): string {
        if (nombreEstado === 'Presentado') return 'presentado';
        if (nombreEstado === 'No Presentado') return 'no_presentado';
        if (nombreEstado === 'Rechazado') return 'rechazado';
        return 'no_presentado';
    }

    private static calculateAge(birthDate: Date): number {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }
}

