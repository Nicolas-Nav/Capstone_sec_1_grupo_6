import { Transaction } from 'sequelize';
import sequelize from '@/config/database';
import { DescripcionCargo, Cargo, Comuna } from '@/models';

/**
 * Servicio para gestión de Descripciones de Cargo
 * Contiene toda la lógica de negocio relacionada con descripciones de cargo y procesamiento de Excel
 */

export class DescripcionCargoService {
    /**
     * Obtener todas las descripciones de cargo
     */
    static async getAllDescripciones() {
        const descripciones = await DescripcionCargo.findAll({
            include: [
                {
                    model: Cargo,
                    as: 'cargo',
                    attributes: ['id_cargo', 'nombre_cargo']
                },
                {
                    model: Comuna,
                    as: 'ciudad',
                    attributes: ['id_ciudad', 'nombre_comuna']
                }
            ],
            order: [['fecha_ingreso', 'DESC']]
        });

        return descripciones.map(desc => ({
            id: desc.id_descripcioncargo,
            descripcion: desc.descripcion_cargo,
            requisitos: desc.requisitos_y_condiciones,
            vacantes: desc.num_vacante,
            fecha_ingreso: desc.fecha_ingreso.toISOString(),
            cargo: {
                id: (desc.get('cargo') as any)?.id_cargo,
                nombre: (desc.get('cargo') as any)?.nombre_cargo
            },
            ciudad: {
                id: (desc.get('ciudad') as any)?.id_ciudad,
                nombre: (desc.get('ciudad') as any)?.nombre_comuna
            },
            tiene_datos_excel: desc.tieneDatosExcel()
        }));
    }

    /**
     * Obtener una descripción de cargo por ID
     */
    static async getDescripcionById(id: number) {
        const descripcion = await DescripcionCargo.findByPk(id, {
            include: [
                {
                    model: Cargo,
                    as: 'cargo',
                    attributes: ['id_cargo', 'nombre_cargo']
                },
                {
                    model: Comuna,
                    as: 'ciudad',
                    attributes: ['id_ciudad', 'nombre_comuna']
                }
            ]
        });

        if (!descripcion) {
            return null;
        }

        return {
            id: descripcion.id_descripcioncargo,
            descripcion: descripcion.descripcion_cargo,
            requisitos: descripcion.requisitos_y_condiciones,
            vacantes: descripcion.num_vacante,
            fecha_ingreso: descripcion.fecha_ingreso.toISOString(),
            cargo: {
                id: (descripcion.get('cargo') as any)?.id_cargo,
                nombre: (descripcion.get('cargo') as any)?.nombre_cargo
            },
            ciudad: {
                id: (descripcion.get('ciudad') as any)?.id_ciudad,
                nombre: (descripcion.get('ciudad') as any)?.nombre_comuna
            },
            datos_excel: descripcion.getDatosExcel(),
            tiene_datos_excel: descripcion.tieneDatosExcel()
        };
    }

    /**
     * Crear nueva descripción de cargo
     */
    static async createDescripcion(data: {
        descripcion: string;
        requisitos: string;
        vacantes: number;
        fecha_ingreso?: Date;
        id_cargo: number;
        id_ciudad: number;
        datos_excel?: object;
    }) {
        const transaction: Transaction = await sequelize.transaction();

        try {
            const {
                descripcion,
                requisitos,
                vacantes,
                fecha_ingreso,
                id_cargo,
                id_ciudad,
                datos_excel
            } = data;

            // Validaciones
            if (!descripcion || !requisitos) {
                throw new Error('La descripción y requisitos son requeridos');
            }

            if (!vacantes || vacantes < 1) {
                throw new Error('Debe haber al menos 1 vacante');
            }

            // Verificar que existe el cargo
            const cargo = await Cargo.findByPk(id_cargo);
            if (!cargo) {
                throw new Error('Cargo no encontrado');
            }

            // Verificar que existe la ciudad
            const ciudad = await Comuna.findByPk(id_ciudad);
            if (!ciudad) {
                throw new Error('Ciudad no encontrada');
            }

            // Crear descripción de cargo
            const nuevaDescripcion = await DescripcionCargo.create({
                descripcion_cargo: descripcion.trim(),
                requisitos_y_condiciones: requisitos.trim(),
                num_vacante: vacantes,
                fecha_ingreso: fecha_ingreso || new Date(),
                id_cargo,
                id_ciudad,
                datos_excel: datos_excel || undefined
            }, { transaction });

            await transaction.commit();

            return {
                id: nuevaDescripcion.id_descripcioncargo,
                descripcion: nuevaDescripcion.descripcion_cargo,
                requisitos: nuevaDescripcion.requisitos_y_condiciones,
                vacantes: nuevaDescripcion.num_vacante,
                fecha_ingreso: nuevaDescripcion.fecha_ingreso.toISOString(),
                tiene_datos_excel: nuevaDescripcion.tieneDatosExcel()
            };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Actualizar descripción de cargo
     */
    static async updateDescripcion(id: number, data: {
        descripcion?: string;
        requisitos?: string;
        vacantes?: number;
        datos_excel?: object;
    }) {
        const descripcion = await DescripcionCargo.findByPk(id);
        
        if (!descripcion) {
            throw new Error('Descripción de cargo no encontrada');
        }

        const updateData: any = {};

        if (data.descripcion) {
            updateData.descripcion_cargo = data.descripcion.trim();
        }
        if (data.requisitos) {
            updateData.requisitos_y_condiciones = data.requisitos.trim();
        }
        if (data.vacantes) {
            updateData.num_vacante = data.vacantes;
        }
        if (data.datos_excel !== undefined) {
            updateData.datos_excel = data.datos_excel;
        }

        await descripcion.update(updateData);

        return {
            id: descripcion.id_descripcioncargo,
            descripcion: descripcion.descripcion_cargo,
            requisitos: descripcion.requisitos_y_condiciones,
            vacantes: descripcion.num_vacante,
            tiene_datos_excel: descripcion.tieneDatosExcel()
        };
    }

    /**
     * Agregar datos de Excel a una descripción de cargo
     */
    static async agregarDatosExcel(id: number, datosExcel: object) {
        const descripcion = await DescripcionCargo.findByPk(id);
        
        if (!descripcion) {
            throw new Error('Descripción de cargo no encontrada');
        }

        await descripcion.update({
            datos_excel: datosExcel
        });

        return {
            id: descripcion.id_descripcioncargo,
            datos_excel: descripcion.getDatosExcel(),
            tiene_datos_excel: true
        };
    }

    /**
     * Obtener datos de Excel de una descripción
     */
    static async getDatosExcel(id: number) {
        const descripcion = await DescripcionCargo.findByPk(id);
        
        if (!descripcion) {
            throw new Error('Descripción de cargo no encontrada');
        }

        if (!descripcion.tieneDatosExcel()) {
            throw new Error('Esta descripción no tiene datos de Excel asociados');
        }

        return {
            id: descripcion.id_descripcioncargo,
            datos_excel: descripcion.getDatosExcel()
        };
    }


    /**
     * Eliminar descripción de cargo
     */
    static async deleteDescripcion(id: number) {
        const descripcion = await DescripcionCargo.findByPk(id);
        
        if (!descripcion) {
            throw new Error('Descripción de cargo no encontrada');
        }

        // Verificar si tiene solicitudes asociadas
        const { Solicitud } = require('@/models');
        const solicitudesActivas = await Solicitud.count({
            where: { id_descripcioncargo: id }
        });

        if (solicitudesActivas > 0) {
            throw new Error('No se puede eliminar la descripción porque tiene solicitudes asociadas');
        }

        await descripcion.destroy();

        return { id };
    }
}

