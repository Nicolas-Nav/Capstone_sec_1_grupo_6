import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@/config/database';

// ===========================================
// INTERFACES TYPESCRIPT
// ===========================================

interface EstadoClientePostulacionAttributes {
    id_estado_cliente: number;
    id_postulacion: number;
    fecha_feedback_cliente_m3?: Date;
    comentario_rech_obs_cliente?: string;
    updated_at: Date;
}

interface EstadoClientePostulacionCreationAttributes extends Optional<EstadoClientePostulacionAttributes, 'fecha_feedback_cliente_m3' | 'comentario_rech_obs_cliente' | 'updated_at'> { }

// ===========================================
// MODELO SEQUELIZE
// ===========================================

class EstadoClientePostulacion extends Model<EstadoClientePostulacionAttributes, EstadoClientePostulacionCreationAttributes> implements EstadoClientePostulacionAttributes {
    public id_estado_cliente!: number;
    public id_postulacion!: number;
    public fecha_feedback_cliente_m3?: Date;
    public comentario_rech_obs_cliente?: string;
    public updated_at!: Date;
}

// ===========================================
// DEFINICIÓN DEL MODELO
// ===========================================

EstadoClientePostulacion.init({
    id_estado_cliente: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
            model: 'estado_cliente',
            key: 'id_estado_cliente'
        },
        validate: {
            notNull: {
                msg: 'El estado del cliente es requerido'
            }
        }
    },
    id_postulacion: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
            model: 'postulacion',
            key: 'id_postulacion'
        },
        validate: {
            notNull: {
                msg: 'La postulación es requerida'
            }
        }
    },
    fecha_feedback_cliente_m3: {
        type: DataTypes.DATE,
        allowNull: true
    },
    comentario_rech_obs_cliente: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    sequelize,
    tableName: 'estado_cliente_postulacion',
    timestamps: false,
    underscored: true,
    indexes: [
        {
            fields: ['id_estado_cliente']
        },
        {
            fields: ['id_postulacion']
        }
    ]
});

export default EstadoClientePostulacion;
