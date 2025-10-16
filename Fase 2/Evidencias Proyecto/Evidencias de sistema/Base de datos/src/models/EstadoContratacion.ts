import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@/config/database';

// ===========================================
// INTERFACES TYPESCRIPT
// ===========================================

interface EstadoContratacionAttributes {
    id_estado_contratacion: number;
    nombre_estado_contratacion: string;
}

interface EstadoContratacionCreationAttributes extends Optional<EstadoContratacionAttributes, 'id_estado_contratacion'> { }

// ===========================================
// MODELO SEQUELIZE
// ===========================================

class EstadoContratacion extends Model<EstadoContratacionAttributes, EstadoContratacionCreationAttributes> implements EstadoContratacionAttributes {
    public id_estado_contratacion!: number;
    public nombre_estado_contratacion!: string;
}

// ===========================================
// DEFINICIÓN DEL MODELO
// ===========================================

EstadoContratacion.init({
    id_estado_contratacion: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    nombre_estado_contratacion: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true,
            len: [3, 100]
        }
    }
}, {
    sequelize,
    tableName: 'estado_contratacion',
    timestamps: false,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['nombre_estado_contratacion']
        }
    ]
});

export default EstadoContratacion;

