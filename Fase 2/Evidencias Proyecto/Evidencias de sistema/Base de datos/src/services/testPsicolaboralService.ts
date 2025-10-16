import { Transaction, Op } from 'sequelize';
import sequelize from '@/config/database';
import { TestPsicolaboral } from '@/models';

/**
 * Servicio para gestión de Tests Psicolaborales
 * Los tests se cargan directamente en la BD mediante scripts SQL
 * Solo se SELECCIONAN desde el frontend (Módulo 4)
 * Los métodos de creación/edición/eliminación son solo para administración
 */

export class TestPsicolaboralService {
    // ===========================================
    // MÉTODOS DE CONSULTA (Usados por el frontend)
    // ===========================================

    /**
     * Obtener todos los tests disponibles
     * Usado en el frontend para seleccionar tests al crear evaluaciones
     */
    static async getAllTests() {
        const tests = await TestPsicolaboral.findAll({
            order: [['nombre_test_psicolaboral', 'ASC']]
        });

        return tests;
    }

    /**
     * Obtener un test por ID
     */
    static async getTestById(id: number) {
        const test = await TestPsicolaboral.findByPk(id);
        return test;
    }

    /**
     * Obtener un test por nombre
     */
    static async getTestByNombre(nombre: string) {
        const test = await TestPsicolaboral.findOne({
            where: { nombre_test_psicolaboral: nombre }
        });
        return test;
    }

    // ===========================================
    // MÉTODOS DE ADMINISTRACIÓN (Solo para admin/seed)
    // ===========================================

    /**
     * Crear un nuevo test psicolaboral
     * Solo para uso administrativo o seeds
     */
    static async createTest(data: {
        nombre_test_psicolaboral: string;
        descripcion_test_psicolaboral: string;
    }) {
        const transaction: Transaction = await sequelize.transaction();

        try {
            // Verificar que no exista un test con el mismo nombre
            const testExistente = await TestPsicolaboral.findOne({
                where: { nombre_test_psicolaboral: data.nombre_test_psicolaboral }
            });

            if (testExistente) {
                throw new Error('Ya existe un test con ese nombre');
            }

            const test = await TestPsicolaboral.create(data, { transaction });

            await transaction.commit();
            return test;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Actualizar un test psicolaboral
     */
    static async updateTest(id: number, data: Partial<{
        nombre_test_psicolaboral: string;
        descripcion_test_psicolaboral: string;
    }>) {
        const transaction: Transaction = await sequelize.transaction();

        try {
            const test = await TestPsicolaboral.findByPk(id);
            if (!test) {
                throw new Error('Test no encontrado');
            }

            // Si se actualiza el nombre, verificar que no exista otro con ese nombre
            if (data.nombre_test_psicolaboral) {
                const testExistente = await TestPsicolaboral.findOne({
                    where: { 
                        nombre_test_psicolaboral: data.nombre_test_psicolaboral,
                        id_test_psicolaboral: { [Op.ne]: id }
                    }
                });

                if (testExistente) {
                    throw new Error('Ya existe un test con ese nombre');
                }
            }

            await test.update(data, { transaction });

            await transaction.commit();
            return test;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Eliminar un test psicolaboral
     */
    static async deleteTest(id: number) {
        const transaction: Transaction = await sequelize.transaction();

        try {
            const test = await TestPsicolaboral.findByPk(id);
            if (!test) {
                throw new Error('Test no encontrado');
            }

            // Aquí podrías verificar si hay evaluaciones que usan este test
            // y prevenir la eliminación si es necesario

            await test.destroy({ transaction });

            await transaction.commit();
            return true;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
}

