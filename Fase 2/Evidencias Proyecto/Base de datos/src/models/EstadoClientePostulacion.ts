import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@/config/database';

// ===========================================
// INTERFACES TYPESCRIPT
// ===========================================

interface EstadoClientePostulacionAttributes {
    fecha_cambio_estado_cliente: Date;
    id_estado_cliente: number;
    id_postulacion: number;
}

interface EstadoClientePostulacionCreationAttributes extends Optional<EstadoClientePostulacionAttributes, 'fecha_cambio_estado_cliente'> { }

// ===========================================
// MODELO SEQUELIZE
// ===========================================

class EstadoClientePostulacion extends Model<EstadoClientePostulacionAttributes, EstadoClientePostulacionCreationAttributes> implements EstadoClientePostulacionAttributes {
    public fecha_cambio_estado_cliente!: Date;
    public id_estado_cliente!: number;
    public id_postulacion!: number;
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
    timestamps: false,
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
