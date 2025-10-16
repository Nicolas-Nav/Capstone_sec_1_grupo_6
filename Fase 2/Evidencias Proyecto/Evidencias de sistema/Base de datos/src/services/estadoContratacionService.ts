import { Transaction, Op } from 'sequelize';
import sequelize from '@/config/database';
import { EstadoContratacion } from '@/models';

/**
 * Servicio para gestión de Estados de Contratación
 * Los estados se cargan directamente en la BD mediante scripts SQL
 * Solo se SELECCIONAN desde el frontend
 * Los métodos de creación/edición/eliminación son solo para administración
 */

export class EstadoContratacionService {
    /**
     * Obtener todos los estados de contratación
     */
    static async getAllEstados() {
        const estados = await EstadoContratacion.findAll({
            order: [['id_estado_contratacion', 'ASC']]
        });

        return estados;
    }

    /**
     * Obtener un estado por ID
     */
    static async getEstadoById(id: number) {
        const estado = await EstadoContratacion.findByPk(id);
        return estado;
    }

    /**
     * Obtener un estado por nombre
     */
    static async getEstadoByNombre(nombre: string) {
        const estado = await EstadoContratacion.findOne({
            where: { nombre_estado_contratacion: nombre }
        });
        return estado;
    }

    /**
     * Crear un nuevo estado de contratación
     */
    static async createEstado(data: {
        nombre_estado_contratacion: string;
    }) {
        const transaction: Transaction = await sequelize.transaction();

        try {
            // Verificar que no exista un estado con el mismo nombre
            const estadoExistente = await EstadoContratacion.findOne({
                where: { nombre_estado_contratacion: data.nombre_estado_contratacion }
            });

            if (estadoExistente) {
                throw new Error('Ya existe un estado con ese nombre');
            }

            const estado = await EstadoContratacion.create(data, { transaction });

            await transaction.commit();
            return estado;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Actualizar un estado de contratación
     */
    static async updateEstado(id: number, data: {
        nombre_estado_contratacion: string;
    }) {
        const transaction: Transaction = await sequelize.transaction();

        try {
            const estado = await EstadoContratacion.findByPk(id);
            if (!estado) {
                throw new Error('Estado no encontrado');
            }

            // Verificar que no exista otro estado con el mismo nombre
            const estadoExistente = await EstadoContratacion.findOne({
                where: { 
                    nombre_estado_contratacion: data.nombre_estado_contratacion,
                    id_estado_contratacion: { [Op.ne]: id }
                }
            });

            if (estadoExistente) {
                throw new Error('Ya existe un estado con ese nombre');
            }

            await estado.update(data, { transaction });

            await transaction.commit();
            return estado;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Eliminar un estado de contratación
     */
    static async deleteEstado(id: number) {
        const transaction: Transaction = await sequelize.transaction();

        try {
            const estado = await EstadoContratacion.findByPk(id);
            if (!estado) {
                throw new Error('Estado no encontrado');
            }

            // Aquí podrías verificar si hay contrataciones con este estado
            // y prevenir la eliminación si es necesario

            await estado.destroy({ transaction });

            await transaction.commit();
            return true;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
}

