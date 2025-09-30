import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@/config/database';
import { validateDateRange } from '@/utils/validators';

// ===========================================
// INTERFACES TYPESCRIPT
// ===========================================

interface SolicitudAttributes {
    id_solicitud: number;
    plazo_maximo_solicitud: Date;
    fecha_ingreso_solicitud: Date;
    id_contacto: number;
    codigo_servicio: string;
    id_descripcioncargo: number;
    rut_usuario: string;
    id_etapa_solicitud: number;
    created_at?: Date;
    updated_at?: Date;
}

interface SolicitudCreationAttributes extends Optional<SolicitudAttributes, 'id_solicitud' | 'created_at' | 'updated_at'> { }

// ===========================================
// MODELO SEQUELIZE
// ===========================================

class Solicitud extends Model<SolicitudAttributes, SolicitudCreationAttributes> implements SolicitudAttributes {
    public id_solicitud!: number;
    public plazo_maximo_solicitud!: Date;
    public fecha_ingreso_solicitud!: Date;
    public id_contacto!: number;
    public codigo_servicio!: string;
    public id_descripcioncargo!: number;
    public rut_usuario!: string;
    public id_etapa_solicitud!: number;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;

    // ===========================================
    // MÉTODOS PERSONALIZADOS
    // ===========================================

    /**
     * Verifica si la solicitud está vencida
     */
    public estaVencida(): boolean {
        return new Date() > this.plazo_maximo_solicitud;
    }

    /**
     * Calcula los días restantes
     */
    public getDiasRestantes(): number {
        const hoy = new Date();
        const diferencia = this.plazo_maximo_solicitud.getTime() - hoy.getTime();
        return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
    }
}

// ===========================================
// DEFINICIÓN DEL MODELO
// ===========================================

Solicitud.init({
    id_solicitud: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    plazo_maximo_solicitud: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
            isDate: true,
            isValidDateRange(value: Date) {
                if (!validateDateRange(value, 14)) {
                    throw new Error('El plazo debe ser desde 2 semanas atrás hasta el futuro');
                }
            }
        }
    },
    fecha_ingreso_solicitud: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
            isDate: true
        }
    },
    id_contacto: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'contacto',
            key: 'id_contacto'
        },
        validate: {
            notNull: {
                msg: 'El contacto es requerido'
            }
        }
    },
    codigo_servicio: {
        type: DataTypes.STRING(2),
        allowNull: false,
        references: {
            model: 'tiposervicio',
            key: 'codigo_servicio'
        },
        validate: {
            notNull: {
                msg: 'El tipo de servicio es requerido'
            }
        }
    },
    id_descripcioncargo: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'descripcioncargo',
            key: 'id_descripcioncargo'
        },
        validate: {
            notNull: {
                msg: 'La descripción del cargo es requerida'
            }
        }
    },
    rut_usuario: {
        type: DataTypes.STRING(12),
        allowNull: false,
        references: {
            model: 'usuario',
            key: 'rut_usuario'
        },
        validate: {
            notNull: {
                msg: 'El usuario es requerido'
            }
        }
    },
    id_etapa_solicitud: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'etapasolicitud',
            key: 'id_etapa_solicitud'
        },
        validate: {
            notNull: {
                msg: 'La etapa es requerida'
            }
        }
    }
}, {
    sequelize,
    tableName: 'solicitud',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    indexes: [
        {
            fields: ['id_contacto']
        },
        {
            fields: ['codigo_servicio']
        },
        {
            fields: ['id_descripcioncargo']
        },
        {
            fields: ['rut_usuario']
        },
        {
            fields: ['id_etapa_solicitud']
        },
        {
            fields: ['plazo_maximo_solicitud']
        }
    ]
});

export default Solicitud;
