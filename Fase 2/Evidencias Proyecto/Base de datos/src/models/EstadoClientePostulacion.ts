import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@/config/database';

// ===========================================
// INTERFACES TYPESCRIPT
// ===========================================

interface EstadoClientePostulacionAttributes {
    fecha_cambio_estado_cliente: Date;
    id_estado_cliente: number;
    id_postulacion: number;
    created_at?: Date;
    updated_at?: Date;
}

interface EstadoClientePostulacionCreationAttributes extends Optional<EstadoClientePostulacionAttributes, 'created_at' | 'updated_at'> { }

// ===========================================
// MODELO SEQUELIZE
// ===========================================

class EstadoClientePostulacion extends Model<EstadoClientePostulacionAttributes, EstadoClientePostulacionCreationAttributes> implements EstadoClientePostulacionAttributes {
    public fecha_cambio_estado_cliente!: Date;
    public id_estado_cliente!: number;
    public id_postulacion!: number;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

// ===========================================
// DEFINICIÓN DEL MODELO
// ===========================================

EstadoClientePostulacion.init({
    fecha_cambio_estado_cliente: {
        type: DataTypes.DATE,
        allowNull: false,
        primaryKey: true,
        validate: {
            isDate: true,
            notNull: {
                msg: 'La fecha del cambio de estado del cliente es requerida'
            }
        }
    },
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
    }
}, {
    sequelize,
    tableName: 'estado_cliente_postulacion',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    indexes: [
        {
            fields: ['id_estado_cliente']
        },
        {
            fields: ['id_postulacion']
        },
        {
            fields: ['fecha_cambio_estado_cliente']
        }
    ]
});

export default EstadoClientePostulacion;
