import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@/config/database';

// ===========================================
// INTERFACES TYPESCRIPT
// ===========================================

interface EstadoClientePostulacionM5Attributes {
    id_estado_cliente_postulacion_m5: number;
    id_postulacion: number;
    fecha_cambio_estado_cliente_m5: Date;
}

interface EstadoClientePostulacionM5CreationAttributes extends Optional<EstadoClientePostulacionM5Attributes, never> { }

// ===========================================
// MODELO SEQUELIZE
// ===========================================

class EstadoClientePostulacionM5 extends Model<EstadoClientePostulacionM5Attributes, EstadoClientePostulacionM5CreationAttributes> implements EstadoClientePostulacionM5Attributes {
    public id_estado_cliente_postulacion_m5!: number;
    public id_postulacion!: number;
    public fecha_cambio_estado_cliente_m5!: Date;
}

// ===========================================
// DEFINICIÓN DEL MODELO
// ===========================================

EstadoClientePostulacionM5.init({
    id_estado_cliente_postulacion_m5: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
            model: 'estado_cliente_m5',
            key: 'id_estado_cliente_postulacion_m5'
        }
    },
    id_postulacion: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
            model: 'postulacion',
            key: 'id_postulacion'
        }
    },
    fecha_cambio_estado_cliente_m5: {
        type: DataTypes.DATE,
        allowNull: false,
        primaryKey: true,
        validate: {
            isDate: true
        }
    }
}, {
    sequelize,
    tableName: 'estado_cliente_postulacion_m5',
    timestamps: false,
    underscored: true,
    indexes: [
        {
            fields: ['id_estado_cliente_postulacion_m5']
        },
        {
            fields: ['id_postulacion']
        },
        {
            fields: ['fecha_cambio_estado_cliente_m5']
        }
    ]
});

export default EstadoClientePostulacionM5;
