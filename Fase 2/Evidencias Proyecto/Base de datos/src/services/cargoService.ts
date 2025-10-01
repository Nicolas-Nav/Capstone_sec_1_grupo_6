import { Cargo } from '@/models';

/**
 * Servicio para gestión de Cargos
 * Contiene toda la lógica de negocio relacionada con cargos/posiciones
 */

export class CargoService {
    /**
     * Obtener todos los cargos
     */
    static async getAllCargos() {
        const cargos = await Cargo.findAll({
            order: [['nombre_cargo', 'ASC']]
        });

        return cargos.map(cargo => ({
            id: cargo.id_cargo,
            nombre: cargo.nombre_cargo
        }));
    }

    /**
     * Obtener un cargo por ID
     */
    static async getCargoById(id: number) {
        const cargo = await Cargo.findByPk(id);

        if (!cargo) {
            return null;
        }

        return {
            id: cargo.id_cargo,
            nombre: cargo.nombre_cargo
        };
    }

    /**
     * Crear nuevo cargo
     */
    static async createCargo(data: { nombre: string }) {
        const { nombre } = data;

        // Validaciones
        if (!nombre || !nombre.trim()) {
            throw new Error('El nombre del cargo es requerido');
        }

        if (nombre.trim().length < 2 || nombre.trim().length > 100) {
            throw new Error('El nombre debe tener entre 2 y 100 caracteres');
        }

        // Crear cargo
        const nuevoCargo = await Cargo.create({
            nombre_cargo: nombre.trim()
        });

        return {
            id: nuevoCargo.id_cargo,
            nombre: nuevoCargo.nombre_cargo
        };
    }

    /**
     * Actualizar cargo
     */
    static async updateCargo(id: number, data: { nombre: string }) {
        const { nombre } = data;

        const cargo = await Cargo.findByPk(id);
        if (!cargo) {
            throw new Error('Cargo no encontrado');
        }

        if (!nombre || !nombre.trim()) {
            throw new Error('El nombre del cargo es requerido');
        }

        await cargo.update({
            nombre_cargo: nombre.trim()
        });

        return {
            id: cargo.id_cargo,
            nombre: cargo.nombre_cargo
        };
    }

    /**
     * Eliminar cargo
     */
    static async deleteCargo(id: number) {
        const cargo = await Cargo.findByPk(id);
        
        if (!cargo) {
            throw new Error('Cargo no encontrado');
        }

        // Verificar si tiene descripciones de cargo asociadas
        const { DescripcionCargo } = require('@/models');
        const descripcionesActivas = await DescripcionCargo.count({
            where: { id_cargo: id }
        });

        if (descripcionesActivas > 0) {
            throw new Error('No se puede eliminar el cargo porque tiene descripciones de cargo asociadas');
        }

        await cargo.destroy();

        return { id };
    }

    /**
     * Buscar o crear cargo por nombre
     */
    static async findOrCreateCargo(nombre: string) {
        let cargo = await Cargo.findOne({
            where: { nombre_cargo: nombre.trim() }
        });

        if (!cargo) {
            cargo = await Cargo.create({
                nombre_cargo: nombre.trim()
            });
        }

        return {
            id: cargo.id_cargo,
            nombre: cargo.nombre_cargo
        };
    }
}

