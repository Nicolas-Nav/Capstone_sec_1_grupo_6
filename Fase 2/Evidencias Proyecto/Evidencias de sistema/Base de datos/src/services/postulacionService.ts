import { Transaction } from 'sequelize';
import sequelize from '@/config/database';
import { Logger } from '@/utils/logger';
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
    CandidatoProfesion,
    Institucion,
    EstadoClientePostulacion,
    EstadoCliente,
    Comuna,
    Region,
    Nacionalidad,
    Rubro
} from '@/models';
import { CandidatoService } from './candidatoService';

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
                            attributes: ['id_comuna', 'nombre_comuna'],
                            include: [
                                {
                                    model: Region,
                                    as: 'region',
                                    attributes: ['id_region', 'nombre_region']
                                }
                            ]
                        },
                        {
                            model: Nacionalidad,
                            as: 'nacionalidad',
                            attributes: ['id_nacionalidad', 'nombre_nacionalidad']
                        },
                        {
                            model: Rubro,
                            as: 'rubro',
                            attributes: ['id_rubro', 'nombre_rubro']
                        },
                        {
                            model: Experiencia,
                            as: 'experiencias'
                        },
                        {
                            model: Profesion,
                            as: 'profesiones',
                            through: { 
                                attributes: ['fecha_obtencion', 'id_institucion']
                            }
                        },
                        {
                            model: PostgradoCapacitacion,
                            as: 'postgradosCapacitaciones',
                            through: { 
                                attributes: ['fecha_obtencion', 'id_institucion']
                            }
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

        const transformedPostulaciones = postulaciones.map(postulacion => this.transformPostulacion(postulacion));
        
        // Llenar nombres de instituciones para cada postulación
        for (let i = 0; i < transformedPostulaciones.length; i++) {
            const candidato = postulaciones[i].get('candidato') as any;
            await this.fillInstitutionNamesForCandidato(transformedPostulaciones[i], candidato);
        }
        
        return transformedPostulaciones;
    }

    /**
     * Crear postulación para un candidato existente
     */
    static async createPostulacionDirecta(data: {
        id_candidato: number;
        id_solicitud: number;
        id_portal_postulacion?: number; // Opcional para evaluación/test psicolaboral
        id_estado_candidato: number;
        motivacion?: string;
        expectativa_renta?: number;
        disponibilidad_postulacion?: string;
        valoracion?: number;
        comentario_no_presentado?: string;
        comentario_rech_obs_cliente?: string;
        comentario_modulo5_cliente?: string;
        situacion_familiar?: string;
        cv_file?: Buffer;
    }) {
        const transaction: Transaction = await sequelize.transaction();

        try {
            // Validar campos requeridos (id_portal_postulacion es opcional)
            if (!data.id_candidato || !data.id_solicitud || !data.id_estado_candidato) {
                throw new Error('Faltan campos requeridos: id_candidato, id_solicitud, id_estado_candidato');
            }

            // Verificar que existe el candidato
            const candidato = await Candidato.findByPk(data.id_candidato);
            if (!candidato) {
                throw new Error('Candidato no encontrado');
            }

            // Verificar que existe la solicitud
            const solicitud = await Solicitud.findByPk(data.id_solicitud);
            if (!solicitud) {
                throw new Error('Solicitud no encontrada');
            }

            // Verificar que existe el portal (solo si se proporciona)
            if (data.id_portal_postulacion) {
                const portal = await PortalPostulacion.findByPk(data.id_portal_postulacion);
                if (!portal) {
                    throw new Error('Portal de postulación no encontrado');
                }
            }

            // Crear la postulación
            const nuevaPostulacion = await Postulacion.create({
                id_candidato: data.id_candidato,
                id_solicitud: data.id_solicitud,
                id_portal_postulacion: data.id_portal_postulacion ?? undefined,
                id_estado_candidato: data.id_estado_candidato,
                motivacion: data.motivacion,
                expectativa_renta: data.expectativa_renta,
                disponibilidad_postulacion: data.disponibilidad_postulacion,
                valoracion: data.valoracion,
                comentario_no_presentado: data.comentario_no_presentado,
                comentario_rech_obs_cliente: data.comentario_rech_obs_cliente,
                comentario_modulo5_cliente: data.comentario_modulo5_cliente,
                situacion_familiar: data.situacion_familiar,
                cv_postulacion: data.cv_file
            }, { transaction });

            await transaction.commit();

            return {
                id: nuevaPostulacion.id_postulacion,
                message: 'Postulación creada exitosamente'
            };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Crear nueva postulación (con candidato)
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
        has_driving_license?: boolean;
        has_disability_credential?: boolean;
        cv_file?: Buffer;
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
                has_driving_license,
                has_disability_credential,
                cv_file,
                work_experience = [],
                education = []
            } = data;

            // Validaciones
            if (!process_id || !name || !email || !phone) {
                throw new Error('Faltan campos requeridos');
            }

            // Verificar que existe la solicitud
            const solicitud = await Solicitud.findByPk(process_id);
            if (!solicitud) {
                throw new Error('Solicitud no encontrada');
            }

            // Buscar o crear candidato usando CandidatoService
            let candidato = await CandidatoService.getCandidatoByEmail(email);

            if (!candidato) {
                // Crear candidato usando el servicio
                const nuevoCandidatoResult = await CandidatoService.createCandidato({
                    name,
                    email,
                    phone,
                    birth_date,
                    comuna,
                    profession,
                    english_level,
                    software_tools,
                    has_disability_credential,
                    work_experience,
                    education
                }, transaction);

                // Obtener el candidato recién creado (modelo Sequelize)
                candidato = await Candidato.findByPk(parseInt(nuevoCandidatoResult.id));
                
                if (!candidato) {
                    throw new Error('Error al crear candidato');
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
                cv_postulacion: cv_file,
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
    static async updateValoracion(id: number, data: {
        valoracion?: number;
        motivacion?: string;
        expectativa_renta?: number;
        disponibilidad_postulacion?: string;
        comentario_no_presentado?: string;
    }) {
        console.log('🔍 === SERVICIO updateValoracion ===');
        console.log('🔍 ID:', id);
        console.log('🔍 Data recibida:', JSON.stringify(data, null, 2));
        
        // Validar valoración si se proporciona
        if (data.valoracion !== undefined && (data.valoracion < 1 || data.valoracion > 5)) {
            throw new Error('La valoración debe estar entre 1 y 5');
        }

        const postulacion = await Postulacion.findByPk(id);
        if (!postulacion) {
            throw new Error('Postulación no encontrada');
        }

        console.log('🔍 Postulación encontrada:', postulacion.id_postulacion);
        console.log('🔍 Valoración actual:', postulacion.valoracion);

        // Actualizar solo los campos proporcionados
        const updateData: any = {};
        if (data.valoracion !== undefined) updateData.valoracion = data.valoracion;
        if (data.motivacion !== undefined) updateData.motivacion = data.motivacion;
        if (data.expectativa_renta !== undefined) updateData.expectativa_renta = data.expectativa_renta;
        if (data.disponibilidad_postulacion !== undefined) updateData.disponibilidad_postulacion = data.disponibilidad_postulacion;
        if (data.comentario_no_presentado !== undefined) updateData.comentario_no_presentado = data.comentario_no_presentado;

        console.log('🔍 Datos a actualizar:', updateData);

        await postulacion.update(updateData);

        console.log('🔍 Postulación actualizada exitosamente');
        console.log('🔍 Nueva valoración:', postulacion.valoracion);

        return { id, ...updateData };
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
     * Subir o actualizar CV de postulación
     */
    static async uploadCV(id: number, cvBuffer: Buffer) {
        try {
            const postulacion = await Postulacion.findByPk(id);
            if (!postulacion) {
                throw new Error('Postulación no encontrada');
            }

            await postulacion.update({
                cv_postulacion: cvBuffer
            });

            return { id, message: 'CV actualizado exitosamente' };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Obtener CV de postulación con información del candidato
     */
    static async getCV(id: number) {
        try {
            const postulacion = await Postulacion.findByPk(id, {
                include: [
                    {
                        model: Candidato,
                        as: 'candidato',
                        attributes: ['nombre_candidato', 'primer_apellido_candidato', 'segundo_apellido_candidato']
                    }
                ]
            });

            if (!postulacion) {
                throw new Error('Postulación no encontrada');
            }

            if (!postulacion.cv_postulacion) {
                throw new Error('La postulación no tiene CV');
            }

            const candidato = postulacion.get('candidato') as any;

            return {
                cv: postulacion.cv_postulacion,
                filename: this.generateCVFilename(candidato)
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Generar nombre de archivo para CV
     */
    private static generateCVFilename(candidato: any): string {
        const nombre = candidato.nombre_candidato || '';
        const primerApellido = candidato.primer_apellido_candidato || '';
        const segundoApellido = candidato.segundo_apellido_candidato || '';
        
        // Remover caracteres especiales y espacios
        const nombreLimpio = nombre.trim().replace(/[^a-zA-Z0-9]/g, '_');
        const apellido1Limpio = primerApellido.trim().replace(/[^a-zA-Z0-9]/g, '_');
        const apellido2Limpio = segundoApellido.trim().replace(/[^a-zA-Z0-9]/g, '_');
        
        return `${nombreLimpio}_${apellido1Limpio}_${apellido2Limpio}_CV.pdf`;
    }

    /**
     * Transformar postulación a formato frontend
     */
    private static transformPostulacion(postulacion: any) {
        const candidato = postulacion.get('candidato') as any;
        const estado = postulacion.get('estadoCandidato') as any;
        const portal = postulacion.get('portalPostulacion') as any;
        const estadosCliente = postulacion.get('estadosCliente') as any[];

        // Obtener el último estado de cliente (más reciente)
        const ultimoEstadoCliente = estadosCliente && estadosCliente.length > 0 
            ? estadosCliente.sort((a: any, b: any) => 
                new Date(b.fecha_cambio_estado_cliente).getTime() - new Date(a.fecha_cambio_estado_cliente).getTime()
              )[0]
            : null;

        const estadoClienteNombre = ultimoEstadoCliente?.estadoCliente?.nombre_estado?.toLowerCase();

        return {
            id: candidato.id_candidato.toString(),
            id_candidato: candidato.id_candidato, // ✅ ID del candidato (número)
            id_postulacion: postulacion.id_postulacion, // ✅ ID de la postulación (número)
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
            birth_date: candidato.fecha_nacimiento_candidato || '',
            age: candidato.edad_candidato,
            comuna: candidato.comuna?.nombre_comuna || '',
            region: candidato.comuna?.region?.nombre_region || '',
            nacionalidad: candidato.nacionalidad?.nombre_nacionalidad || '',
            rubro: candidato.rubro?.nombre_rubro || '',
            profession: candidato.profesiones?.[0]?.nombre_profesion || '',
            profession_institution: '', // Se llenará después con consulta separada
            profession_date: candidato.profesiones?.[0]?.CandidatoProfesion?.fecha_obtencion ? new Date(candidato.profesiones[0].CandidatoProfesion.fecha_obtencion).toISOString().split('T')[0] : '',
            professions: candidato.profesiones?.map((prof: any) => ({
                profession: prof.nombre_profesion,
                institution: '', // Se llenará después con consulta separada
                date: prof.CandidatoProfesion?.fecha_obtencion ? new Date(prof.CandidatoProfesion.fecha_obtencion).toISOString().split('T')[0] : ''
            })) || [],
            consultant_comment: postulacion.comentario_no_presentado,
            presentation_status: this.mapPresentationStatus(estado?.nombre_estado_candidato),
            rejection_reason: postulacion.comentario_rech_obs_cliente,
            // Campos del módulo 3 - Presentación de candidatos
            presentation_date: postulacion.fecha_envio ? (postulacion.fecha_envio instanceof Date ? postulacion.fecha_envio.toISOString() : new Date(postulacion.fecha_envio).toISOString()) : undefined,
            client_response: estadoClienteNombre || undefined,
            client_feedback_date: postulacion.fecha_feedback_cliente ? (postulacion.fecha_feedback_cliente instanceof Date ? postulacion.fecha_feedback_cliente.toISOString() : new Date(postulacion.fecha_feedback_cliente).toISOString()) : undefined,
            client_comments: postulacion.comentario_rech_obs_cliente || undefined,
            has_disability_credential: candidato.discapacidad,
            licencia: candidato.licencia,
            work_experience: candidato.experiencias?.map((exp: any) => ({
                id: exp.id_experiencia.toString(),
                company: exp.empresa,
                position: exp.cargo,
                start_date: exp.fecha_inicio_experiencia || '',
                end_date: exp.fecha_fin_experiencia || '',
                is_current: !exp.fecha_fin_experiencia,
                description: exp.descripcion_funciones_experiencia,
                comments: '',
                exit_reason: ''
            })) || [],
            education: candidato.postgradosCapacitaciones?.map((edu: any) => ({
                id: edu.id_postgradocapacitacion.toString(),
                type: 'postgrado',
                institution: '', // Se llenará después con consulta separada
                title: edu.nombre_postgradocapacitacion,
                start_date: '', // No hay fecha de inicio en el modelo actual
                completion_date: (edu.CandidatoPostgradoCapacitaci || edu.CandidatoPostgradoCapacitacion)?.fecha_obtencion ? 
                    new Date((edu.CandidatoPostgradoCapacitaci || edu.CandidatoPostgradoCapacitacion).fecha_obtencion).toISOString().split('T')[0] : '',
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
     * Llenar nombres de instituciones en los datos transformados
     */
    private static async fillInstitutionNamesForCandidato(transformedData: any, candidato: any): Promise<void> {
        // Llenar institución de profesión (primera)
        if (candidato.profesiones?.[0]?.CandidatoProfesion?.id_institucion) {
            const institucionProfesion = await Institucion.findByPk(candidato.profesiones[0].CandidatoProfesion.id_institucion);
            if (institucionProfesion) {
                transformedData.profession_institution = institucionProfesion.nombre_institucion;
            }
        }

        // Llenar instituciones de todas las profesiones
        if (candidato.profesiones && transformedData.professions) {
            for (let i = 0; i < candidato.profesiones.length; i++) {
                const prof = candidato.profesiones[i];
                if (prof.CandidatoProfesion?.id_institucion && transformedData.professions[i]) {
                    const institucionProf = await Institucion.findByPk(prof.CandidatoProfesion.id_institucion);
                    if (institucionProf) {
                        transformedData.professions[i].institution = institucionProf.nombre_institucion;
                    }
                }
            }
        }

        // Llenar instituciones de educación
        if (candidato.postgradosCapacitaciones && transformedData.education) {
            for (let i = 0; i < candidato.postgradosCapacitaciones.length; i++) {
                const edu = candidato.postgradosCapacitaciones[i];
                
                // Hacer consulta separada para obtener datos de la tabla intermedia
                const candidatoPostgrado = await CandidatoPostgradoCapacitacion.findOne({
                    where: {
                        id_candidato: candidato.id_candidato,
                        id_postgradocapacitacion: edu.id_postgradocapacitacion
                    }
                });
                
                if (candidatoPostgrado?.id_institucion && transformedData.education[i]) {
                    const institucionEducacion = await Institucion.findByPk(candidatoPostgrado.id_institucion);
                    
                    if (institucionEducacion) {
                        transformedData.education[i].institution = institucionEducacion.nombre_institucion;
                    }
                    
                    // También llenar la fecha de obtención
                    if (candidatoPostgrado.fecha_obtencion) {
                        transformedData.education[i].completion_date = new Date(candidatoPostgrado.fecha_obtencion).toISOString().split('T')[0];
                    }
                }
            }
        }
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


