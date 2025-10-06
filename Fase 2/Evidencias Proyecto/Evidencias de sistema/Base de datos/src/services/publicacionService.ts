import { Transaction } from 'sequelize';
import sequelize from '@/config/database';
import { Publicacion, PortalPostulacion, Solicitud } from '@/models';

/**
 * Servicio para gestión de Publicaciones
 * Contiene toda la lógica de negocio relacionada con publicaciones de ofertas
 */

export class PublicacionService {
    /**
     * Obtener todas las publicaciones
     */
    static async getAllPublicaciones(filters?: {
        solicitud_id?: number;
        portal_id?: number;
        estado?: string;
    }) {
        const whereClause: any = {};

        if (filters?.solicitud_id) {
            whereClause.id_solicitud = filters.solicitud_id;
        }
        if (filters?.portal_id) {
            whereClause.id_portal_postulacion = filters.portal_id;
        }
        if (filters?.estado) {
            whereClause.estado_publicacion = filters.estado;
        }

        const publicaciones = await Publicacion.findAll({
            where: whereClause,
            include: [
                {
                    model: PortalPostulacion,
                    as: 'portalPostulacion'
                },
                {
                    model: Solicitud,
                    as: 'solicitud'
                }
            ],
            order: [['fecha_publicacion', 'DESC']]
        });

        return publicaciones.map(pub => this.transformPublicacion(pub));
    }

    /**
     * Obtener una publicación por ID
     */
    static async getPublicacionById(id: number) {
        const publicacion = await Publicacion.findByPk(id, {
            include: [
                {
                    model: PortalPostulacion,
                    as: 'portalPostulacion'
                },
                {
                    model: Solicitud,
                    as: 'solicitud'
                }
            ]
        });

        if (!publicacion) {
            return null;
        }

        return this.transformPublicacion(publicacion);
    }

    /**
     * Crear nueva publicación
     */
    static async createPublicacion(data: {
        id_solicitud: number;
        id_portal_postulacion: number;
        url_publicacion: string;
        estado_publicacion?: string;
        fecha_publicacion?: Date;
    }) {
        const transaction: Transaction = await sequelize.transaction();

        try {
            const {
                id_solicitud,
                id_portal_postulacion,
                url_publicacion,
                estado_publicacion = 'Activa',
                fecha_publicacion = new Date()
            } = data;

            // Validaciones
            if (!id_solicitud || !id_portal_postulacion || !url_publicacion) {
                throw new Error('Faltan campos requeridos');
            }

            // Verificar que existe la solicitud
            const solicitud = await Solicitud.findByPk(id_solicitud);
            if (!solicitud) {
                throw new Error('Solicitud no encontrada');
            }

            // Verificar que existe el portal
            const portal = await PortalPostulacion.findByPk(id_portal_postulacion);
            if (!portal) {
                throw new Error('Portal de postulación no encontrado');
            }

            // Crear publicación
            const nuevaPublicacion = await Publicacion.create({
                id_solicitud,
                id_portal_postulacion,
                url_publicacion,
                estado_publicacion,
                fecha_publicacion
            }, { transaction });

            await transaction.commit();

            return {
                id: nuevaPublicacion.id_publicacion,
                message: 'Publicación creada exitosamente'
            };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Actualizar publicación
     */
    static async updatePublicacion(id: number, data: {
        url_publicacion?: string;
        estado_publicacion?: string;
        fecha_publicacion?: Date;
    }) {
        const transaction: Transaction = await sequelize.transaction();

        try {
            const publicacion = await Publicacion.findByPk(id);

            if (!publicacion) {
                throw new Error('Publicación no encontrada');
            }

            await publicacion.update(data, { transaction });

            await transaction.commit();

            return {
                id: publicacion.id_publicacion,
                message: 'Publicación actualizada exitosamente'
            };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Eliminar publicación
     */
    static async deletePublicacion(id: number) {
        const transaction: Transaction = await sequelize.transaction();

        try {
            const publicacion = await Publicacion.findByPk(id);

            if (!publicacion) {
                throw new Error('Publicación no encontrada');
            }

            await publicacion.destroy({ transaction });

            await transaction.commit();

            return {
                message: 'Publicación eliminada exitosamente'
            };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Obtener todos los portales de postulación
     */
    static async getAllPortales() {
        const portales = await PortalPostulacion.findAll({
            order: [['nombre_portal_postulacion', 'ASC']]
        });

        return portales.map(portal => ({
            id: portal.id_portal_postulacion,
            nombre: portal.nombre_portal_postulacion
        }));
    }

    /**
     * Transformar publicación a formato frontend
     */
    private static transformPublicacion(publicacion: any) {
        const portal = publicacion.get('portalPostulacion') as any;
        const solicitud = publicacion.get('solicitud') as any;

        return {
            id: publicacion.id_publicacion,
            id_publicacion: publicacion.id_publicacion,
            id_solicitud: publicacion.id_solicitud,
            id_portal_postulacion: publicacion.id_portal_postulacion,
            fecha_publicacion: publicacion.fecha_publicacion,
            estado_publicacion: publicacion.estado_publicacion,
            url_publicacion: publicacion.url_publicacion,
            portal: {
                id: portal?.id_portal_postulacion,
                nombre: portal?.nombre_portal_postulacion
            },
            solicitud: solicitud ? {
                id: solicitud.id_solicitud
            } : null
        };
    }
}

