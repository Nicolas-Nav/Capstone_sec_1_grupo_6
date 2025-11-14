import { Transaction } from 'sequelize';
import sequelize from '@/config/database';
import {
    Candidato,
    Experiencia,
    Profesion,
    PostgradoCapacitacion,
    CandidatoProfesion,
    CandidatoPostgradoCapacitacion,
    Institucion,
    Comuna,
    Nacionalidad,
    Rubro,
    Postulacion
} from '@/models';
import { setDatabaseUser } from '@/utils/databaseUser';

/**
 * Servicio para gestión de Candidatos
 * Contiene toda la lógica de negocio relacionada con candidatos y su información
 */

export class CandidatoService {
    /**
     * Obtener todos los candidatos con información completa
     */
    static async getAllCandidatos(filters?: {
        email?: string;
        rut?: string;
        comuna?: string;
    }) {
        const whereClause: any = {};

        if (filters?.email) {
            whereClause.email_candidato = filters.email;
        }
        if (filters?.rut) {
            whereClause.rut_candidato = filters.rut;
        }

        const candidatos = await Candidato.findAll({
            where: whereClause,
            include: [
                {
                    model: Comuna,
                    as: 'comuna',
                    attributes: ['id_comuna', 'nombre_comuna']
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
                },
                {
                    model: Postulacion,
                    as: 'postulaciones',
                    attributes: ['id_postulacion', 'valoracion', 'motivacion', 'expectativa_renta', 'disponibilidad_postulacion', 'comentario_no_presentado', 'id_estado_candidato']
                }
            ],
            order: [['id_candidato', 'DESC']]
        });

        return candidatos.map(candidato => this.transformCandidato(candidato));
    }

    /**
     * Obtener un candidato por ID
     */
    static async getCandidatoById(id: number) {
        const candidato = await Candidato.findByPk(id, {
            include: [
                {
                    model: Comuna,
                    as: 'comuna',
                    attributes: ['id_comuna', 'nombre_comuna']
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
                },
                {
                    model: Postulacion,
                    as: 'postulaciones',
                    attributes: ['id_postulacion', 'valoracion', 'motivacion', 'expectativa_renta', 'disponibilidad_postulacion', 'comentario_no_presentado', 'id_estado_candidato']
                }
            ]
        });

        if (!candidato) {
            return null;
        }

        return this.transformCandidato(candidato);
    }

    /**
     * Buscar candidato por email (retorna modelo Sequelize para uso interno)
     */
    static async getCandidatoByEmail(email: string) {
        const candidato = await Candidato.findOne({
            where: { email_candidato: email.trim() },
            include: [
                {
                    model: Comuna,
                    as: 'comuna'
                },
                {
                    model: Nacionalidad,
                    as: 'nacionalidad'
                },
                {
                    model: Rubro,
                    as: 'rubro'
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
                    through: { attributes: [] }
                }
            ]
        });

        return candidato;
    }

    /**
     * Buscar candidato por email (retorna formato frontend)
     */
    static async getCandidatoByEmailFormatted(email: string) {
        const candidato = await this.getCandidatoByEmail(email);
        
        if (!candidato) {
            return null;
        }

        return this.transformCandidato(candidato);
    }

    /**
     * Crear nuevo candidato con toda su información
     */
    static async createCandidato(data: {
        nombre: string;
        primer_apellido: string;
        segundo_apellido?: string;
        email: string;
        phone: string;
        rut?: string;
        birth_date?: string;
        comuna?: string;
        nacionalidad?: string;
        rubro?: string;
        profession?: string;
        profession_institution?: string;
        profession_date?: string;
        professions?: Array<{
            profession: string;
            institution: string;
            date?: string;
        }>;
        english_level?: string;
        software_tools?: string;
        has_disability_credential?: boolean;
        licencia?: boolean;
        work_experience?: any[];
        education?: any[];
    }, transaction?: Transaction) {
        console.log('=== CREANDO CANDIDATO ===');
        console.log('Datos recibidos:', JSON.stringify(data, null, 2));
        
        const useTransaction = transaction || await sequelize.transaction();

        try {
            const {
                nombre,
                primer_apellido,
                segundo_apellido,
                email,
                phone,
                rut,
                birth_date,
                comuna,
                nacionalidad,
                rubro,
                profession,
                profession_institution,
                profession_date,
                professions,
                english_level,
                software_tools,
                has_disability_credential,
                licencia,
                work_experience = [],
                education = []
            } = data;

            // Validaciones
            console.log('Validando campos requeridos...');
            if (!nombre || !primer_apellido || !email || !phone) {
                console.error('Faltan campos requeridos:', { nombre, primer_apellido, email, phone });
                throw new Error('Faltan campos requeridos');
            }

            // Verificar si el candidato ya existe
            console.log('Verificando si el candidato ya existe...');
            const candidatoExistente = await this.getCandidatoByEmail(email);
            if (candidatoExistente) {
                console.error('Candidato ya existe con email:', email);
                throw new Error('Ya existe un candidato con este email');
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

            // Buscar nacionalidad
            let idNacionalidad: number | undefined = undefined;
            if (nacionalidad && nacionalidad.trim()) {
                const nacionalidadFound = await Nacionalidad.findOne({
                    where: { nombre_nacionalidad: nacionalidad.trim() }
                });
                idNacionalidad = nacionalidadFound?.id_nacionalidad;
            }

            // Buscar rubro
            let idRubro: number | undefined = undefined;
            if (rubro && rubro.trim()) {
                const rubroFound = await Rubro.findOne({
                    where: { nombre_rubro: rubro.trim() }
                });
                idRubro = rubroFound?.id_rubro;
            }

            // Crear el candidato
            console.log('Creando candidato en la base de datos...');
            const nuevoCandidato = await Candidato.create({
                rut_candidato: rut,
                nombre_candidato: nombre.trim(),
                primer_apellido_candidato: primer_apellido.trim(),
                segundo_apellido_candidato: segundo_apellido?.trim() || 'N/A',
                telefono_candidato: phone.trim(),
                email_candidato: email.trim(),
                fecha_nacimiento_candidato: birth_date ? new Date(birth_date) : undefined,
                edad_candidato: birth_date ? this.calculateAge(new Date(birth_date)) : undefined,
                nivel_ingles: english_level,
                software_herramientas: software_tools,
                discapacidad: has_disability_credential || false,
                licencia: licencia || false,
                id_comuna: idComuna,
                id_nacionalidad: idNacionalidad,
                id_rubro: idRubro
            }, { transaction: useTransaction });
            console.log('Candidato creado exitosamente:', nuevoCandidato.id_candidato);

            // Agregar experiencias laborales
            console.log('🔍 Verificando experiencias laborales:', work_experience?.length || 0);
            console.log('🔍 Datos de experiencias:', work_experience);
            if (work_experience && work_experience.length > 0) {
                console.log('📝 Agregando experiencias laborales...');
                await this.addExperiencias(nuevoCandidato.id_candidato, work_experience, useTransaction);
                console.log('✅ Experiencias laborales agregadas');
            }

            // Agregar formación académica
            console.log('🔍 Verificando formación académica:', education?.length || 0);
            console.log('🔍 Datos de educación:', education);
            if (education && education.length > 0) {
                console.log('📚 Agregando formación académica...');
                await this.addEducacion(nuevoCandidato.id_candidato, education, useTransaction);
                console.log('✅ Formación académica agregada');
            }

            // Agregar profesiones si se especificaron
            console.log('🔍 Verificando profesiones:', professions);
            if (professions && Array.isArray(professions) && professions.length > 0) {
                console.log('🎓 Agregando múltiples profesiones...');
                for (const prof of professions) {
                    if (prof.profession && prof.institution) {
                        await this.addProfesion(
                            nuevoCandidato.id_candidato, 
                            prof.profession, 
                            prof.institution, 
                            prof.date, 
                            useTransaction
                        );
                    }
                }
                console.log('✅ Profesiones agregadas');
            } else if (profession) {
                // Comportamiento legacy: una sola profesión
                const professionValue = typeof profession === 'string' ? profession.trim() : String(profession);
                if (professionValue) {
                    console.log('🎓 Agregando profesión (legacy)...');
                    await this.addProfesion(nuevoCandidato.id_candidato, profession, profession_institution, profession_date, useTransaction);
                    console.log('✅ Profesión agregada');
                }
            }

            // Si no se pasó una transacción externa, hacer commit
            if (!transaction) {
                await useTransaction.commit();
            }

            // Obtener el candidato completo con todas las relaciones (sin transacción)
            const candidatoCompleto = await Candidato.findByPk(nuevoCandidato.id_candidato, {
                include: [
                    {
                        model: Comuna,
                        as: 'comuna',
                        attributes: ['id_comuna', 'nombre_comuna']
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
            });

            if (!candidatoCompleto) {
                return {
                    id: nuevoCandidato.id_candidato.toString(),
                    email: nuevoCandidato.email_candidato
                };
            }

            // Retornar en formato frontend
            return this.transformCandidato(candidatoCompleto);
        } catch (error: any) {
            console.error('=== ERROR AL CREAR CANDIDATO ===');
            console.error('Error completo:', error);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
            
            // Solo hacer rollback si la transacción es interna
            if (!transaction) {
                console.log('Haciendo rollback de la transacción...');
                await useTransaction.rollback();
            }
            throw error;
        }
    }

    /**
     * Actualizar candidato
     */
    static async updateCandidato(id: number, data: {
        nombre?: string;
        primer_apellido?: string;
        segundo_apellido?: string;
        email?: string;
        phone?: string;
        rut?: string;
        birth_date?: string;
        age?: number;
        region?: string;
        comuna?: string;
        nacionalidad?: string;
        rubro?: string;
        professions?: Array<{
            profession: string;
            institution: string;
            date: string;
        }>;
        english_level?: string;
        software_tools?: string;
        has_disability_credential?: boolean;
        licencia?: boolean;
        work_experience?: Array<{
            company: string;
            position: string;
            start_date: string;
            end_date: string;
            description: string;
        }>;
        education?: Array<{
            title: string;
            institution: string;
            completion_date: string;
        }>;
    }, usuarioRut?: string) {
        const transaction: Transaction = await sequelize.transaction();

        try {
            // Establecer el usuario en la sesión para los triggers de auditoría
            if (usuarioRut) {
                await setDatabaseUser(usuarioRut, transaction);
            }
            const candidato = await Candidato.findByPk(id);
            if (!candidato) {
                throw new Error('Candidato no encontrado');
            }

            const updateData: any = {};

            if (data.nombre) {
                updateData.nombre_candidato = data.nombre.trim();
            }
            if (data.primer_apellido) {
                updateData.primer_apellido_candidato = data.primer_apellido.trim();
            }
            if (data.segundo_apellido !== undefined) {
                // Si segundo_apellido está vacío o es muy corto, usar "N/A"
                updateData.segundo_apellido_candidato = data.segundo_apellido && data.segundo_apellido.trim().length >= 2
                    ? data.segundo_apellido.trim()
                    : 'N/A';
            }

            if (data.email) updateData.email_candidato = data.email.trim();
            if (data.phone) updateData.telefono_candidato = data.phone.trim();
            if (data.rut) updateData.rut_candidato = data.rut;
            if (data.english_level !== undefined) updateData.nivel_ingles = data.english_level;
            if (data.software_tools !== undefined) updateData.software_herramientas = data.software_tools;
            if (data.has_disability_credential !== undefined) updateData.discapacidad = data.has_disability_credential;
            if (data.licencia !== undefined) updateData.licencia = data.licencia;

            if (data.birth_date) {
                const fechaNacimiento = new Date(data.birth_date);
                updateData.fecha_nacimiento_candidato = fechaNacimiento;
                updateData.edad_candidato = this.calculateAge(fechaNacimiento);
            }

            if (data.comuna) {
                const comunaFound = await Comuna.findOne({
                    where: { nombre_comuna: data.comuna.trim() }
                });
                if (comunaFound) {
                    updateData.id_comuna = comunaFound.id_comuna;
                }
            }

            if (data.nacionalidad) {
                const nacionalidadFound = await Nacionalidad.findOne({
                    where: { nombre_nacionalidad: data.nacionalidad.trim() }
                });
                if (nacionalidadFound) {
                    updateData.id_nacionalidad = nacionalidadFound.id_nacionalidad;
                }
            }

            if (data.rubro) {
                const rubroFound = await Rubro.findOne({
                    where: { nombre_rubro: data.rubro.trim() }
                });
                if (rubroFound) {
                    updateData.id_rubro = rubroFound.id_rubro;
                }
            }

            // Actualizar edad si se proporciona
            if (data.age !== undefined) {
                updateData.edad_candidato = data.age;
            }

            await candidato.update(updateData, { transaction });

            // Actualizar profesiones si se proporciona
            // Si se envía un array (incluso vacío), se actualizan las profesiones
            if (data.professions !== undefined) {
                // Eliminar todas las relaciones de profesión existentes
                await CandidatoProfesion.destroy({
                    where: { id_candidato: id },
                    transaction
                });

                // Crear nuevas relaciones de profesión solo si hay elementos en el array
                if (data.professions.length > 0) {
                    for (const prof of data.professions) {
                        if (prof.profession && prof.institution) {
                            // Buscar la profesión (por ID si es número, por nombre si es texto)
                            let profesion;
                            const professionValue = prof.profession.trim();
                            
                            // Si es un número, buscar por ID
                            if (!isNaN(Number(professionValue))) {
                                profesion = await Profesion.findByPk(parseInt(professionValue));
                            } else {
                                // Si es texto, buscar por nombre
                                profesion = await Profesion.findOne({
                                    where: { nombre_profesion: professionValue }
                                });
                            }

                            if (!profesion) {
                                throw new Error(`Profesión no encontrada: ${professionValue}`);
                            }

                            // Buscar la institución
                            let institucion = null;
                            if (prof.institution) {
                                institucion = await Institucion.findOne({
                                    where: { nombre_institucion: prof.institution.trim() }
                                });
                            }

                            // Solo crear la relación si hay institución (requerido)
                            if (institucion) {
                                await CandidatoProfesion.create({
                                    id_candidato: id,
                                    id_profesion: profesion.id_profesion,
                                    fecha_obtencion: prof.date ? this.parseDateOnly(prof.date) : undefined,
                                    id_institucion: institucion.id_institucion
                                }, { transaction });
                            }
                        }
                    }
                }
            }

            // Actualizar experiencia laboral si se proporciona
            // Si se envía un array (incluso vacío), se actualizan las experiencias
            if (data.work_experience !== undefined) {
                // Eliminar todas las experiencias existentes
                await Experiencia.destroy({
                    where: { id_candidato: id },
                    transaction
                });

                // Crear nuevas experiencias solo si hay elementos en el array
                if (data.work_experience.length > 0) {
                    for (const exp of data.work_experience) {
                        if (exp.company && exp.position) {
                            await Experiencia.create({
                                id_candidato: id,
                                empresa: exp.company.trim(),
                                cargo: exp.position.trim(),
                                fecha_inicio_experiencia: exp.start_date ? this.parseDateOnly(exp.start_date) : new Date(),
                                fecha_fin_experiencia: exp.end_date ? this.parseDateOnly(exp.end_date) : undefined,
                                descripcion_funciones_experiencia: exp.description || ''
                            }, { transaction });
                        }
                    }
                }
            }

            // Actualizar educación si se proporciona
            // Si se envía un array (incluso vacío), se actualizan las capacitaciones
            if (data.education !== undefined) {
                console.log('📚 Guardando educación para candidato', id, ':', data.education);
                
                // Eliminar todas las relaciones de educación existentes
                await CandidatoPostgradoCapacitacion.destroy({
                    where: { id_candidato: id },
                    transaction
                });

                // Crear nuevas relaciones de educación solo si hay elementos en el array
                if (data.education.length > 0) {
                    for (const edu of data.education) {
                        console.log('📖 Procesando educación:', edu);
                        if (edu.title && edu.institution) {
                            // Buscar o crear el postgrado/capacitación
                            let postgrado = await PostgradoCapacitacion.findOne({
                                where: { nombre_postgradocapacitacion: edu.title.trim() }
                            });

                            if (!postgrado) {
                                postgrado = await PostgradoCapacitacion.create({
                                    nombre_postgradocapacitacion: edu.title.trim()
                                }, { transaction });
                            }

                            // Buscar o crear la institución (siempre debe existir porque ya validamos edu.institution)
                            let institucion = await Institucion.findOne({
                                where: { nombre_institucion: edu.institution.trim() }
                            });
                            
                            // Si no existe, crearla
                            if (!institucion) {
                                institucion = await Institucion.create({
                                    nombre_institucion: edu.institution.trim()
                                }, { transaction });
                            }

                            // Crear la relación (institucion siempre existe aquí después del if)
                            if (institucion) {
                                const relationData = {
                                    id_candidato: id,
                                    id_postgradocapacitacion: postgrado.id_postgradocapacitacion,
                                    fecha_obtencion: edu.completion_date ? this.parseDateOnly(edu.completion_date) : new Date(),
                                    id_institucion: institucion.id_institucion
                                };
                                
                                console.log('💾 Guardando relación CandidatoPostgradoCapacitacion:', relationData);
                                await CandidatoPostgradoCapacitacion.create(relationData, { transaction });
                                console.log('✅ Educación guardada exitosamente');
                            }
                        } else {
                            console.log('⚠️ Educación NO guardada - falta título o institución');
                        }
                    }
                }
            }

            await transaction.commit();

            // Obtener el candidato actualizado con todas las relaciones
            const candidatoActualizado = await Candidato.findByPk(id, {
                include: [
                    {
                        model: Comuna,
                        as: 'comuna',
                        attributes: ['id_comuna', 'nombre_comuna']
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
            });

            if (!candidatoActualizado) {
                return { id: id.toString() };
            }

            return this.transformCandidato(candidatoActualizado);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Eliminar candidato
     */
    static async deleteCandidato(id: number) {
        const transaction: Transaction = await sequelize.transaction();

        try {
            const candidato = await Candidato.findByPk(id);
            if (!candidato) {
                throw new Error('Candidato no encontrado');
            }

            // Verificar si tiene postulaciones activas
            const { Postulacion } = require('@/models');
            const postulacionesActivas = await Postulacion.count({
                where: { id_candidato: id },
                transaction
            });

            if (postulacionesActivas > 0) {
                throw new Error('No se puede eliminar el candidato porque tiene postulaciones asociadas');
            }

            // Eliminar experiencias
            await Experiencia.destroy({
                where: { id_candidato: id },
                transaction
            });

            // Eliminar relaciones con profesiones
            await CandidatoProfesion.destroy({
                where: { id_candidato: id },
                transaction
            });

            // Eliminar relaciones con postgrados/capacitaciones
            await CandidatoPostgradoCapacitacion.destroy({
                where: { id_candidato: id },
                transaction
            });

            // Eliminar candidato
            await candidato.destroy({ transaction });

            await transaction.commit();

            return { id };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * EXPERIENCIAS LABORALES
     */

    /**
     * Agregar experiencias a un candidato
     */
    static async addExperiencias(idCandidato: number, experiencias: any[], transaction?: Transaction) {
        console.log('💼 addExperiencias - Iniciando:', { idCandidato, experiencias });
        const useTransaction = transaction || await sequelize.transaction();

        try {
            for (const exp of experiencias) {
                console.log('💼 Procesando experiencia:', exp);
                const nuevaExperiencia = await Experiencia.create({
                    empresa: exp.company,
                    cargo: exp.position,
                    fecha_inicio_experiencia: exp.start_date ? this.parseDateOnly(exp.start_date) : new Date(),
                    fecha_fin_experiencia: exp.end_date ? this.parseDateOnly(exp.end_date) : undefined,
                    descripcion_funciones_experiencia: exp.description || '',
                    id_candidato: idCandidato
                }, { transaction: useTransaction });
                console.log('💼 Experiencia creada con ID:', nuevaExperiencia.id_experiencia);
            }

            if (!transaction) {
                await useTransaction.commit();
            }

            return { success: true };
        } catch (error) {
            if (!transaction) {
                await useTransaction.rollback();
            }
            throw error;
        }
    }

    /**
     * Obtener experiencias de un candidato
     */
    static async getExperiencias(idCandidato: number) {
        const experiencias = await Experiencia.findAll({
            where: { id_candidato: idCandidato },
            order: [['fecha_inicio_experiencia', 'DESC']]
        });

        return experiencias.map(exp => ({
            id: exp.id_experiencia.toString(),
            company: exp.empresa,
            position: exp.cargo,
            start_date: exp.fecha_inicio_experiencia?.toISOString().split('T')[0] || '',
            end_date: exp.fecha_fin_experiencia?.toISOString().split('T')[0] || '',
            is_current: !exp.fecha_fin_experiencia,
            description: exp.descripcion_funciones_experiencia || '',
            comments: '',
            exit_reason: ''
        }));
    }

    /**
     * Actualizar experiencia
     */
    static async updateExperiencia(id: number, data: any) {
        const experiencia = await Experiencia.findByPk(id);
        if (!experiencia) {
            throw new Error('Experiencia no encontrada');
        }

        await experiencia.update({
            empresa: data.company,
            cargo: data.position,
            fecha_inicio_experiencia: data.start_date ? this.parseDateOnly(data.start_date) : experiencia.fecha_inicio_experiencia,
            fecha_fin_experiencia: data.end_date ? this.parseDateOnly(data.end_date) : undefined,
            descripcion_funciones_experiencia: data.description || experiencia.descripcion_funciones_experiencia
        });

        return { id };
    }

    /**
     * Eliminar experiencia
     */
    static async deleteExperiencia(id: number) {
        const experiencia = await Experiencia.findByPk(id);
        if (!experiencia) {
            throw new Error('Experiencia no encontrada');
        }

        await experiencia.destroy();

        return { id };
    }

    /**
     * EDUCACIÓN (POSTGRADOS Y CAPACITACIONES)
     */

    /**
     * Agregar educación a un candidato
     */
    static async addEducacion(idCandidato: number, educacion: any[], transaction?: Transaction) {
        console.log('📚 addEducacion - Iniciando:', { idCandidato, educacion });
        const useTransaction = transaction || await sequelize.transaction();

        try {
            for (const edu of educacion) {
                console.log('📚 Procesando educación:', edu);
                
                // Buscar o crear institución
                let institucion = await Institucion.findOne({
                    where: { nombre_institucion: edu.institution }
                });

                if (!institucion) {
                    console.log('📚 Creando nueva institución:', edu.institution);
                    institucion = await Institucion.create({
                        nombre_institucion: edu.institution
                    }, { transaction: useTransaction });
                } else {
                    console.log('📚 Institución encontrada:', institucion.nombre_institucion);
                }

                // Crear postgrado/capacitación
                console.log('📚 Creando postgrado/capacitación:', edu.title);
                const formacion = await PostgradoCapacitacion.create({
                    nombre_postgradocapacitacion: edu.title
                }, { transaction: useTransaction });
                console.log('📚 Postgrado creado con ID:', formacion.id_postgradocapacitacion);

                // Crear relación candidato-postgrado
                console.log('📚 Creando relación candidato-postgrado');
                await CandidatoPostgradoCapacitacion.create({
                    id_candidato: idCandidato,
                    id_postgradocapacitacion: formacion.id_postgradocapacitacion,
                    id_institucion: institucion.id_institucion, // ✅ AGREGADO
                    fecha_obtencion: edu.completion_date ? this.parseDateOnly(edu.completion_date) : new Date()
                }, { transaction: useTransaction });
                console.log('📚 Relación creada exitosamente');
            }

            if (!transaction) {
                await useTransaction.commit();
            }

            return { success: true };
        } catch (error) {
            if (!transaction) {
                await useTransaction.rollback();
            }
            throw error;
        }
    }

    /**
     * Agregar profesión a un candidato
     */
    static async addProfesion(idCandidato: number, profesionIdOrNombre: string | number, nombreInstitucion?: string, fechaObtencion?: string, transaction?: Transaction) {
        console.log('🎓 addProfesion - Iniciando:', { idCandidato, profesionIdOrNombre, nombreInstitucion, fechaObtencion });
        const useTransaction = transaction || await sequelize.transaction();

        try {
            // Buscar o crear institución (por defecto "Sin Institución")
            const nombreInst = nombreInstitucion && nombreInstitucion.trim() ? nombreInstitucion.trim() : 'Sin Institución';
            let institucion = await Institucion.findOne({
                where: { nombre_institucion: nombreInst },
                transaction: useTransaction
            });

            if (!institucion) {
                console.log('🎓 Creando nueva institución:', nombreInst);
                institucion = await Institucion.create({
                    nombre_institucion: nombreInst
                }, { transaction: useTransaction });
            } else {
                console.log('🎓 Institución encontrada:', institucion.nombre_institucion);
            }

            // Verificar si es un ID numérico o un nombre
            let profesion;
            const profesionId = typeof profesionIdOrNombre === 'number' ? profesionIdOrNombre : parseInt(profesionIdOrNombre.toString());
            
            if (!isNaN(profesionId) && profesionId > 0) {
                // Es un ID, buscar la profesión directamente
                console.log('🎓 Buscando profesión por ID:', profesionId);
                profesion = await Profesion.findByPk(profesionId, { transaction: useTransaction });
                
                if (!profesion) {
                    throw new Error(`No se encontró la profesión con ID: ${profesionId}`);
                }
                console.log('🎓 Profesión encontrada por ID:', profesion.nombre_profesion);
            } else {
                // Es un nombre, buscar o crear profesión (comportamiento legacy)
                console.log('🎓 Buscando profesión por nombre:', profesionIdOrNombre);
                profesion = await Profesion.findOne({
                    where: { nombre_profesion: profesionIdOrNombre.toString().trim() },
                    transaction: useTransaction
                });

                if (!profesion) {
                    console.log('🎓 Creando nueva profesión:', profesionIdOrNombre);
                    profesion = await Profesion.create({
                        nombre_profesion: profesionIdOrNombre.toString().trim()
                    }, { transaction: useTransaction });
                } else {
                    console.log('🎓 Profesión encontrada:', profesion.nombre_profesion);
                }
            }

            // Verificar si ya existe la relación
            const relacionExistente = await CandidatoProfesion.findOne({
                where: {
                    id_candidato: idCandidato,
                    id_profesion: profesion.id_profesion
                },
                transaction: useTransaction
            });

            if (!relacionExistente) {
                // Crear relación candidato-profesión
                await CandidatoProfesion.create({
                    id_candidato: idCandidato,
                    id_profesion: profesion.id_profesion,
                    id_institucion: institucion.id_institucion, // ✅ AGREGADO
                    fecha_obtencion: fechaObtencion ? this.parseDateOnly(fechaObtencion) : new Date()
                }, { transaction: useTransaction });
            }

            if (!transaction) {
                await useTransaction.commit();
            }

            return { success: true };
        } catch (error) {
            if (!transaction) {
                await useTransaction.rollback();
            }
            throw error;
        }
    }

    /**
     * TRANSFORMACIONES
     */

    /**
     * Transformar candidato a formato frontend
     */
    private static transformCandidato(candidato: any) {
        return {
            id: candidato.id_candidato.toString(),
            name: candidato.getNombreCompleto(),
            email: candidato.email_candidato,
            phone: candidato.telefono_candidato,
            rut: candidato.rut_candidato || undefined,
            birth_date: candidato.fecha_nacimiento_candidato?.toISOString().split('T')[0],
            age: candidato.edad_candidato,
            comuna: candidato.comuna?.nombre_comuna || '',
            nacionalidad: candidato.nacionalidad?.nombre_nacionalidad || '',
            rubro: candidato.rubro?.nombre_rubro || '',
            profession: candidato.profesiones?.[0]?.nombre_profesion || '',
            english_level: candidato.nivel_ingles,
            software_tools: candidato.software_herramientas,
            has_disability_credential: candidato.discapacidad,
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
                title: edu.nombre_postgradocapacitacion,
                institution: '', // Se puede obtener por separado si es necesario
                start_date: '',
                completion_date: edu.CandidatoPostgradoCapacitacion?.fecha_obtencion?.toISOString().split('T')[0] || '',
                observations: ''
            })) || [],
            consultant_rating: candidato.postulaciones?.[0]?.valoracion || 3
        };
    }

    /**
     * HELPERS
     */

    /**
     * Convertir string de fecha YYYY-MM-DD a Date sin problemas de zona horaria
     * Agrega T12:00:00 para usar mediodía y evitar cambios de día por zona horaria
     */
    private static parseDateOnly(dateString: string): Date {
        return new Date(dateString + 'T12:00:00');
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

    /**
     * Obtener postulación de un candidato por su ID
     */
    static async getPostulacionByCandidato(idCandidato: number) {
        const { Postulacion } = await import('@/models');
        
        const postulacion = await Postulacion.findOne({
            where: { id_candidato: idCandidato }
        });

        return postulacion;
    }

    /**
     * Actualizar estado del candidato
     */
    static async updateStatus(idCandidato: number, status: string, comment?: string) {
        const transaction = await sequelize.transaction();

        try {
            // Buscar el candidato
            const candidato = await Candidato.findByPk(idCandidato);
            if (!candidato) {
                throw new Error('Candidato no encontrado');
            }

            // Buscar la postulación asociada
            const { Postulacion } = await import('@/models');
            const postulacion = await Postulacion.findOne({
                where: { id_candidato: idCandidato }
            });

            if (!postulacion) {
                throw new Error('Postulación no encontrada para este candidato');
            }

            // Mapear estados del frontend a IDs de la base de datos
            const statusMapping: { [key: string]: number } = {
                'presentado': 1,    // "Presentado"
                'no_presentado': 2, // "No presentado" 
                'rechazado': 3,     // "Rechazado"
                'agregado': 6       // "Agregado"
            };

            const idEstadoCandidato = statusMapping[status];
            if (!idEstadoCandidato) {
                throw new Error('Estado inválido');
            }

            // Actualizar la postulación con el nuevo estado
            const updateData: any = {
                id_estado_candidato: idEstadoCandidato
            };

            // Si es "no_presentado", agregar el comentario
            if (status === 'no_presentado' && comment) {
                updateData.comentario_no_presentado = comment;
            }

            await postulacion.update(updateData, { transaction });

            await transaction.commit();

            return {
                id: candidato.id_candidato,
                status: status,
                comment: comment || null,
                message: `Estado del candidato actualizado a: ${status}`
            };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
}

