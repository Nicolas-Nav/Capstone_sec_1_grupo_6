import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@/config/database';

// ===========================================
// INTERFACES TYPESCRIPT
// ===========================================

interface EstadoClientePostulacionM5Attributes {
    id_estado_cliente_postulacion_m5: number;
    id_postulacion: number;
    fecha_feedback_cliente_m5?: Date;
    comentario_modulo5_cliente?: string;
    updated_at: Date;
}

interface EstadoClientePostulacionM5CreationAttributes extends Optional<EstadoClientePostulacionM5Attributes, 'fecha_feedback_cliente_m5' | 'comentario_modulo5_cliente' | 'updated_at'> { }

// ===========================================
// MODELO SEQUELIZE
// ===========================================

class EstadoClientePostulacionM5 extends Model<EstadoClientePostulacionM5Attributes, EstadoClientePostulacionM5CreationAttributes> implements EstadoClientePostulacionM5Attributes {
    public id_estado_cliente_postulacion_m5!: number;
    public id_postulacion!: number;
    public fecha_feedback_cliente_m5?: Date;
    public comentario_modulo5_cliente?: string;
    public updated_at!: Date;
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
    fecha_feedback_cliente_m5: {
        type: DataTypes.DATE,
        allowNull: true
    },
    comentario_modulo5_cliente: {
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
            fields: ['updated_at']
        }
    ]
});

export default EstadoClientePostulacionM5;
