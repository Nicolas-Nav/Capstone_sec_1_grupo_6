import { Transaction } from 'sequelize';
import sequelize from '@/config/database';
import { ReferenciaLaboral, Candidato } from '@/models';

/**
 * Servicio para gestión de Referencias Laborales
 */

export class ReferenciaLaboralService {
    /**
     * Obtener todas las referencias laborales
     */
    static async getAllReferencias() {
        const referencias = await ReferenciaLaboral.findAll({
            include: [
                {
                    model: Candidato,
                    as: 'candidato',
                    attributes: ['id_candidato', 'nombre_candidato', 'primer_apellido_candidato', 'segundo_apellido_candidato']
                }
            ],
            order: [['id_referencia_laboral', 'DESC']]
        });

        return referencias;
    }

    /**
     * Obtener referencias laborales por candidato
     */
    static async getReferenciasByCandidato(idCandidato: number) {
        const referencias = await ReferenciaLaboral.findAll({
            where: { id_candidato: idCandidato },
            order: [['id_referencia_laboral', 'DESC']]
        });

        return referencias;
    }

    /**
     * Obtener una referencia por ID
     */
    static async getReferenciaById(id: number) {
        const referencia = await ReferenciaLaboral.findByPk(id, {
            include: [
                {
                    model: Candidato,
                    as: 'candidato',
                    attributes: ['id_candidato', 'nombre_candidato', 'primer_apellido_candidato', 'segundo_apellido_candidato']
                }
            ]
        });

        return referencia;
    }

    /**
     * Crear una nueva referencia laboral
     */
    static async createReferencia(data: {
        nombre_referencia: string;
        cargo_referencia: string;
        empresa_referencia: string;
        telefono_referencia: string;
        email_referencia: string;
        id_candidato: number;
        relacion_postulante_referencia: string;
        comentario_referencia?: string;
    }) {
        const transaction: Transaction = await sequelize.transaction();

        try {
            // Verificar que el candidato existe
            const candidato = await Candidato.findByPk(data.id_candidato);
            if (!candidato) {
                throw new Error('Candidato no encontrado');
            }

            const referencia = await ReferenciaLaboral.create(data, { transaction });

            await transaction.commit();
            return referencia;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Actualizar una referencia laboral
     */
    static async updateReferencia(id: number, data: Partial<{
        nombre_referencia: string;
        cargo_referencia: string;
        empresa_referencia: string;
        telefono_referencia: string;
        email_referencia: string;
        relacion_postulante_referencia: string;
        comentario_referencia: string;
    }>) {
        const transaction: Transaction = await sequelize.transaction();

        try {
            const referencia = await ReferenciaLaboral.findByPk(id);
            if (!referencia) {
                throw new Error('Referencia laboral no encontrada');
            }

            await referencia.update(data, { transaction });

            await transaction.commit();
            return referencia;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Eliminar una referencia laboral
     */
    static async deleteReferencia(id: number) {
        const transaction: Transaction = await sequelize.transaction();

        try {
            const referencia = await ReferenciaLaboral.findByPk(id);
            if (!referencia) {
                throw new Error('Referencia laboral no encontrada');
            }

            await referencia.destroy({ transaction });

            await transaction.commit();
            return true;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Crear múltiples referencias para un candidato
     */
    static async createMultiplesReferencias(idCandidato: number, referencias: Array<{
        nombre_referencia: string;
        cargo_referencia: string;
        empresa_referencia: string;
        telefono_referencia: string;
        email_referencia: string;
        relacion_postulante_referencia: string;
        comentario_referencia?: string;
    }>) {
        const transaction: Transaction = await sequelize.transaction();

        try {
            // Verificar que el candidato existe
            const candidato = await Candidato.findByPk(idCandidato);
            if (!candidato) {
                throw new Error('Candidato no encontrado');
            }

            const referenciasCreadas = await Promise.all(
                referencias.map(ref =>
                    ReferenciaLaboral.create({
                        ...ref,
                        id_candidato: idCandidato
                    }, { transaction })
                )
            );

            await transaction.commit();
            return referenciasCreadas;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
}

