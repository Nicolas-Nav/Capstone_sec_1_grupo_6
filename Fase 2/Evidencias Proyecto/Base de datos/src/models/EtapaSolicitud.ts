import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@/config/database';

// ===========================================
// INTERFACES TYPESCRIPT
// ===========================================

interface EtapaSolicitudAttributes {
    id_etapa_solicitud: number;
    nombre_etapa: string;
    created_at?: Date;
    updated_at?: Date;
}

interface EtapaSolicitudCreationAttributes extends Optional<EtapaSolicitudAttributes, 'id_etapa_solicitud' | 'created_at' | 'updated_at'> { }

// ===========================================
// MODELO SEQUELIZE
// ===========================================

class EtapaSolicitud extends Model<EtapaSolicitudAttributes, EtapaSolicitudCreationAttributes> implements EtapaSolicitudAttributes {
    public id_etapa_solicitud!: number;
    public nombre_etapa!: string;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

// ===========================================
// DEFINICIÓN DEL MODELO
// ===========================================

EtapaSolicitud.init({
    id_etapa_solicitud: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    nombre_etapa: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'El nombre de la etapa es requerido'
            },
            len: {
                args: [2, 100],
                msg: 'El nombre debe tener entre 2 y 100 caracteres'
            }
        }
    }
}, {
    sequelize,
    tableName: 'etapasolicitud',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['nombre_etapa']
        }
    ]
});

export default EtapaSolicitud;
