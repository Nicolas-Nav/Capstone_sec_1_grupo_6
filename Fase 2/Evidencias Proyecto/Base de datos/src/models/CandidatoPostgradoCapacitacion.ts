import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@/config/database';

// ===========================================
// INTERFACES TYPESCRIPT
// ===========================================

interface CandidatoPostgradoCapacitacionAttributes {
    fecha_obtencion: Date;
    id_postgradocapacitacion: number;
    id_candidato: number;
    created_at?: Date;
    updated_at?: Date;
}

interface CandidatoPostgradoCapacitacionCreationAttributes extends Optional<CandidatoPostgradoCapacitacionAttributes, 'created_at' | 'updated_at'> { }

// ===========================================
// MODELO SEQUELIZE
// ===========================================

class CandidatoPostgradoCapacitacion extends Model<CandidatoPostgradoCapacitacionAttributes, CandidatoPostgradoCapacitacionCreationAttributes> implements CandidatoPostgradoCapacitacionAttributes {
    public fecha_obtencion!: Date;
    public id_postgradocapacitacion!: number;
    public id_candidato!: number;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

// ===========================================
// DEFINICIÓN DEL MODELO
// ===========================================

CandidatoPostgradoCapacitacion.init({
    fecha_obtencion: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
            isDate: true,
            notNull: {
                msg: 'La fecha de obtención es requerida'
            }
        }
    },
    id_postgradocapacitacion: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
            model: 'postgradocapacitacion',
            key: 'id_postgradocapacitacion'
        },
        validate: {
            notNull: {
                msg: 'El postgrado/capacitación es requerido'
            }
        }
    },
    id_candidato: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
            model: 'candidato',
            key: 'id_candidato'
        },
        validate: {
            notNull: {
                msg: 'El candidato es requerido'
            }
        }
    }
}, {
    sequelize,
    tableName: 'candidatopostgradocapacitacion',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    indexes: [
        {
            fields: ['id_postgradocapacitacion']
        },
        {
            fields: ['id_candidato']
        },
        {
            fields: ['fecha_obtencion']
        }
    ]
});

export default CandidatoPostgradoCapacitacion;
