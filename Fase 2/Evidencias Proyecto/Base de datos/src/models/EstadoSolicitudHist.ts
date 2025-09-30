import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@/config/database';

// ===========================================
// INTERFACES TYPESCRIPT
// ===========================================

interface EstadoSolicitudHistAttributes {
    fecha_cambio_estado_solicitud: Date;
    id_estado_solicitud: number;
    id_solicitud: number;
    created_at?: Date;
    updated_at?: Date;
}

interface EstadoSolicitudHistCreationAttributes extends Optional<EstadoSolicitudHistAttributes, 'created_at' | 'updated_at'> { }

// ===========================================
// MODELO SEQUELIZE
// ===========================================

class EstadoSolicitudHist extends Model<EstadoSolicitudHistAttributes, EstadoSolicitudHistCreationAttributes> implements EstadoSolicitudHistAttributes {
    public fecha_cambio_estado_solicitud!: Date;
    public id_estado_solicitud!: number;
    public id_solicitud!: number;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;

    // ===========================================
    // MÉTODOS PERSONALIZADOS
    // ===========================================

    /**
     * Obtiene la fecha formateada
     */
    public getFechaFormateada(): string {
        return this.fecha_cambio_estado_solicitud.toLocaleDateString('es-CL');
    }

    /**
     * Obtiene la fecha y hora formateada
     */
    public getFechaHoraFormateada(): string {
        return this.fecha_cambio_estado_solicitud.toLocaleString('es-CL');
    }

    /**
     * Verifica si el cambio fue hoy
     */
    public fueHoy(): boolean {
        const hoy = new Date();
        const fechaCambio = new Date(this.fecha_cambio_estado_solicitud);

        return fechaCambio.toDateString() === hoy.toDateString();
    }

    /**
     * Verifica si el cambio fue en los últimos N días
     */
    public fueEnUltimosDias(dias: number): boolean {
        const hoy = new Date();
        const fechaCambio = new Date(this.fecha_cambio_estado_solicitud);
        const diferenciaDias = Math.floor((hoy.getTime() - fechaCambio.getTime()) / (1000 * 60 * 60 * 24));

        return diferenciaDias <= dias;
    }

    /**
     * Obtiene información completa del cambio de estado
     */
    public getInfoCambio(): {
        fecha: string;
        fechaHora: string;
        fueHoy: boolean;
        fueEnUltimos7Dias: boolean;
        fueEnUltimos30Dias: boolean;
    } {
        return {
            fecha: this.getFechaFormateada(),
            fechaHora: this.getFechaHoraFormateada(),
            fueHoy: this.fueHoy(),
            fueEnUltimos7Dias: this.fueEnUltimosDias(7),
            fueEnUltimos30Dias: this.fueEnUltimosDias(30)
        };
    }
}

// ===========================================
// DEFINICIÓN DEL MODELO
// ===========================================

EstadoSolicitudHist.init({
    fecha_cambio_estado_solicitud: {
        type: DataTypes.DATE,
        allowNull: false,
        primaryKey: true,
        validate: {
            isDate: true,
            notNull: {
                msg: 'La fecha del cambio de estado es requerida'
            }
        }
    },
    id_estado_solicitud: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
            model: 'estado',
            key: 'id_estado_solicitud'
        },
        validate: {
            notNull: {
                msg: 'El estado de la solicitud es requerido'
            }
        }
    },
    id_solicitud: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
            model: 'solicitud',
            key: 'id_solicitud'
        },
        validate: {
            notNull: {
                msg: 'La solicitud es requerida'
            }
        }
    }
}, {
    sequelize,
    tableName: 'estado_solicitud_hist',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    indexes: [
        {
            fields: ['id_estado_solicitud']
        },
        {
            fields: ['id_solicitud']
        },
        {
            fields: ['fecha_cambio_estado_solicitud']
        }
    ]
});

export default EstadoSolicitudHist;
