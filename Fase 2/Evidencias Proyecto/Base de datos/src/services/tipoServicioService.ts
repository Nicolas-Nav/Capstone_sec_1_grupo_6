import { TipoServicio } from '@/models';

/**
 * Servicio para gestión de Tipos de Servicio
 * Contiene toda la lógica de negocio relacionada con tipos de servicio de reclutamiento
 */

export class TipoServicioService {
    /**
     * Obtener todos los tipos de servicio
     */
    static async getAllTiposServicio() {
        const tiposServicio = await TipoServicio.findAll({
            order: [['nombre_servicio', 'ASC']]
        });

        return tiposServicio.map(tipo => ({
            codigo: tipo.codigo_servicio,
            nombre: tipo.nombre_servicio
        }));
    }

    /**
     * Obtener un tipo de servicio por código
     */
    static async getTipoServicioByCodigo(codigo: string) {
        const tipoServicio = await TipoServicio.findByPk(codigo);

        if (!tipoServicio) {
            return null;
        }

        return {
            codigo: tipoServicio.codigo_servicio,
            nombre: tipoServicio.nombre_servicio
        };
    }

    /**
     * Crear nuevo tipo de servicio
     */
    static async createTipoServicio(data: { codigo: string; nombre: string }) {
        const { codigo, nombre } = data;

        // Validaciones
        if (!codigo || !nombre) {
            throw new Error('El código y nombre del servicio son requeridos');
        }

        if (codigo.length !== 2) {
            throw new Error('El código debe tener exactamente 2 caracteres');
        }

        // Crear tipo de servicio
        const nuevoTipo = await TipoServicio.create({
            codigo_servicio: codigo.toUpperCase().trim(),
            nombre_servicio: nombre.trim()
        });

        return {
            codigo: nuevoTipo.codigo_servicio,
            nombre: nuevoTipo.nombre_servicio
        };
    }

    /**
     * Actualizar tipo de servicio
     */
    static async updateTipoServicio(codigo: string, data: { nombre: string }) {
        const { nombre } = data;

        const tipoServicio = await TipoServicio.findByPk(codigo);
        if (!tipoServicio) {
            throw new Error('Tipo de servicio no encontrado');
        }

        if (!nombre || !nombre.trim()) {
            throw new Error('El nombre del servicio es requerido');
        }

        await tipoServicio.update({
            nombre_servicio: nombre.trim()
        });

        return {
            codigo: tipoServicio.codigo_servicio,
            nombre: tipoServicio.nombre_servicio
        };
    }

    /**
     * Eliminar tipo de servicio
     */
    static async deleteTipoServicio(codigo: string) {
        const tipoServicio = await TipoServicio.findByPk(codigo);
        
        if (!tipoServicio) {
            throw new Error('Tipo de servicio no encontrado');
        }

        // Verificar si tiene solicitudes asociadas
        const { Solicitud } = require('@/models');
        const solicitudesActivas = await Solicitud.count({
            where: { codigo_servicio: codigo }
        });

        if (solicitudesActivas > 0) {
            throw new Error('No se puede eliminar el tipo de servicio porque tiene solicitudes asociadas');
        }

        await tipoServicio.destroy();

        return { codigo };
    }
}

