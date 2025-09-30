import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@/config/database';

// ===========================================
// INTERFACES TYPESCRIPT
// ===========================================

interface EtapaSolicitudAttributes {
    id_etapa_solicitud: number;
    nombre_etapa: string;
}

interface EtapaSolicitudCreationAttributes extends Optional<EtapaSolicitudAttributes, 'id_etapa_solicitud'> { }

// ===========================================
// MODELO SEQUELIZE
// ===========================================

class EtapaSolicitud extends Model<EtapaSolicitudAttributes, EtapaSolicitudCreationAttributes> implements EtapaSolicitudAttributes {
    public id_etapa_solicitud!: number;
    public nombre_etapa!: string;
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
    timestamps: false,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['nombre_etapa']
        }
    ]
});

export default EtapaSolicitud;
