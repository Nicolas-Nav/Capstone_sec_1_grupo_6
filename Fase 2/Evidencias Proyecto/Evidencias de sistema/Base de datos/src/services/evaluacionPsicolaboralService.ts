import { Transaction } from 'sequelize';
import sequelize from '@/config/database';
import { EvaluacionPsicolaboral, EvaluacionTest, TestPsicolaboral, Postulacion } from '@/models';

/**
 * Servicio para gestión de Evaluaciones Psicolaborales
 */

export class EvaluacionPsicolaboralService {
    /**
     * Obtener todas las evaluaciones
     */
    static async getAllEvaluaciones() {
        const evaluaciones = await EvaluacionPsicolaboral.findAll({
            include: [
                {
                    model: Postulacion,
                    as: 'postulacion',
                    attributes: ['id_postulacion', 'id_candidato', 'id_solicitud']
                },
                {
                    model: TestPsicolaboral,
                    as: 'tests',
                    through: {
                        attributes: ['resultado_test']
                    }
                }
            ],
            order: [['fecha_evaluacion', 'DESC']]
        });

        return evaluaciones;
    }

    /**
     * Obtener evaluaciones por postulación
     */
    static async getEvaluacionesByPostulacion(idPostulacion: number) {
        const evaluaciones = await EvaluacionPsicolaboral.findAll({
            where: { id_postulacion: idPostulacion },
            include: [
                {
                    model: TestPsicolaboral,
                    as: 'tests',
                    through: {
                        attributes: ['resultado_test']
                    }
                }
            ],
            order: [['fecha_evaluacion', 'DESC']]
        });

        return evaluaciones;
    }

    /**
     * Obtener evaluaciones pendientes (Sin programar o Programadas)
     */
    static async getEvaluacionesPendientes() {
        const evaluaciones = await EvaluacionPsicolaboral.findAll({
            where: {
                estado_evaluacion: ['Sin programar', 'Programada']
            },
            include: [
                {
                    model: Postulacion,
                    as: 'postulacion'
                }
            ],
            order: [['fecha_evaluacion', 'ASC']]
        });

        return evaluaciones;
    }

    /**
     * Obtener una evaluación por ID
     */
    static async getEvaluacionById(id: number) {
        const evaluacion = await EvaluacionPsicolaboral.findByPk(id, {
            include: [
                {
                    model: Postulacion,
                    as: 'postulacion'
                },
                {
                    model: TestPsicolaboral,
                    as: 'tests',
                    through: {
                        attributes: ['resultado_test']
                    }
                }
            ]
        });

        return evaluacion;
    }

    /**
     * Crear una nueva evaluación psicolaboral
     */
    static async createEvaluacion(data: {
        fecha_evaluacion: Date;
        fecha_envio_informe: Date;
        estado_evaluacion: string;
        estado_informe: string;
        conclusion_global: string;
        id_postulacion: number;
        tests?: Array<{
            id_test_psicolaboral: number;
            resultado_test: string;
        }>;
    }) {
        const transaction: Transaction = await sequelize.transaction();

        try {
            // Verificar que la postulación existe
            const postulacion = await Postulacion.findByPk(data.id_postulacion);
            if (!postulacion) {
                throw new Error('Postulación no encontrada');
            }

            // Crear la evaluación
            const evaluacion = await EvaluacionPsicolaboral.create({
                fecha_evaluacion: data.fecha_evaluacion,
                fecha_envio_informe: data.fecha_envio_informe,
                estado_evaluacion: data.estado_evaluacion,
                estado_informe: data.estado_informe,
                conclusion_global: data.conclusion_global,
                id_postulacion: data.id_postulacion
            }, { transaction });

            // Si se proporcionan tests, crear las relaciones
            if (data.tests && data.tests.length > 0) {
                for (const test of data.tests) {
                    // Verificar que el test existe
                    const testExiste = await TestPsicolaboral.findByPk(test.id_test_psicolaboral);
                    if (!testExiste) {
                        throw new Error(`Test ${test.id_test_psicolaboral} no encontrado`);
                    }

                    await EvaluacionTest.create({
                        id_evaluacion_psicolaboral: evaluacion.id_evaluacion_psicolaboral,
                        id_test_psicolaboral: test.id_test_psicolaboral,
                        resultado_test: test.resultado_test
                    }, { transaction });
                }
            }

            await transaction.commit();
            
            // Retornar la evaluación con sus tests
            return await this.getEvaluacionById(evaluacion.id_evaluacion_psicolaboral);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Actualizar una evaluación psicolaboral
     */
    static async updateEvaluacion(id: number, data: Partial<{
        fecha_evaluacion: Date;
        fecha_envio_informe: Date;
        estado_evaluacion: string;
        estado_informe: string;
        conclusion_global: string;
    }>) {
        const transaction: Transaction = await sequelize.transaction();

        try {
            const evaluacion = await EvaluacionPsicolaboral.findByPk(id);
            if (!evaluacion) {
                throw new Error('Evaluación no encontrada');
            }

            await evaluacion.update(data, { transaction });

            await transaction.commit();
            return evaluacion;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Agregar resultado de test a una evaluación
     */
    static async addTestResultado(idEvaluacion: number, idTest: number, resultado: string) {
        const transaction: Transaction = await sequelize.transaction();

        try {
            const evaluacion = await EvaluacionPsicolaboral.findByPk(idEvaluacion);
            if (!evaluacion) {
                throw new Error('Evaluación no encontrada');
            }

            const test = await TestPsicolaboral.findByPk(idTest);
            if (!test) {
                throw new Error('Test no encontrado');
            }

            // Verificar si ya existe el resultado
            const existente = await EvaluacionTest.findOne({
                where: {
                    id_evaluacion_psicolaboral: idEvaluacion,
                    id_test_psicolaboral: idTest
                }
            });

            if (existente) {
                // Actualizar
                await existente.update({ resultado_test: resultado }, { transaction });
            } else {
                // Crear
                await EvaluacionTest.create({
                    id_evaluacion_psicolaboral: idEvaluacion,
                    id_test_psicolaboral: idTest,
                    resultado_test: resultado
                }, { transaction });
            }

            await transaction.commit();
            return await this.getEvaluacionById(idEvaluacion);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Eliminar resultado de test de una evaluación
     */
    static async deleteTestResultado(idEvaluacion: number, idTest: number) {
        const transaction: Transaction = await sequelize.transaction();

        try {
            const evaluacionTest = await EvaluacionTest.findOne({
                where: {
                    id_evaluacion_psicolaboral: idEvaluacion,
                    id_test_psicolaboral: idTest
                }
            });

            if (!evaluacionTest) {
                throw new Error('Resultado de test no encontrado');
            }

            await evaluacionTest.destroy({ transaction });

            await transaction.commit();
            return true;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Marcar evaluación como realizada
     */
    static async marcarComoRealizada(id: number) {
        const transaction: Transaction = await sequelize.transaction();

        try {
            const evaluacion = await EvaluacionPsicolaboral.findByPk(id);
            if (!evaluacion) {
                throw new Error('Evaluación no encontrada');
            }

            await evaluacion.update({
                estado_evaluacion: 'Realizada'
            }, { transaction });

            await transaction.commit();
            return evaluacion;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Actualizar estado de informe
     */
    static async actualizarEstadoInforme(id: number, estadoInforme: 'Pendiente' | 'Recomendable' | 'No recomendable' | 'Recomendable con observaciones') {
        const transaction: Transaction = await sequelize.transaction();

        try {
            const evaluacion = await EvaluacionPsicolaboral.findByPk(id);
            if (!evaluacion) {
                throw new Error('Evaluación no encontrada');
            }

            await evaluacion.update({
                estado_informe: estadoInforme,
                fecha_envio_informe: new Date()
            }, { transaction });

            await transaction.commit();
            return evaluacion;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Eliminar una evaluación psicolaboral
     */
    static async deleteEvaluacion(id: number) {
        const transaction: Transaction = await sequelize.transaction();

        try {
            const evaluacion = await EvaluacionPsicolaboral.findByPk(id);
            if (!evaluacion) {
                throw new Error('Evaluación no encontrada');
            }

            // Eliminar primero los resultados de tests
            await EvaluacionTest.destroy({
                where: { id_evaluacion_psicolaboral: id },
                transaction
            });

            // Eliminar la evaluación
            await evaluacion.destroy({ transaction });

            await transaction.commit();
            return true;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
}

