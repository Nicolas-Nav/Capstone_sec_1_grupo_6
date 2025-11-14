import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@/config/database';

// ===========================================
// INTERFACES TYPESCRIPT
// ===========================================

interface CandidatoPostgradoCapacitacionAttributes {
    fecha_obtencion: Date;
    id_postgradocapacitacion: number;
    id_candidato: number;
    id_institucion: number; 
}

interface CandidatoPostgradoCapacitacionCreationAttributes
    extends Optional<CandidatoPostgradoCapacitacionAttributes, 'fecha_obtencion'> { }

// ===========================================
// MODELO SEQUELIZE
// ===========================================

class CandidatoPostgradoCapacitacion
    extends Model<CandidatoPostgradoCapacitacionAttributes, CandidatoPostgradoCapacitacionCreationAttributes>
    implements CandidatoPostgradoCapacitacionAttributes {

    public fecha_obtencion!: Date;
    public id_postgradocapacitacion!: number;
    public id_candidato!: number;
    public id_institucion!: number;
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
    },
    id_institucion: {
        type: DataTypes.INTEGER,
        allowNull: false, 
        primaryKey: true,
        references: {
            model: 'institucion',
            key: 'id_institucion'
        },
        validate: {
            notNull: {
                msg: 'La institución es requerida'
            }
        }
    }
}, {
    sequelize,
    tableName: 'candidatopostgradocapacitacion',
    timestamps: false,
    underscored: true,
    indexes: [
        {
            fields: ['id_postgradocapacitacion']
        },
        {
            fields: ['id_candidato']
        },
        {
            fields: ['id_institucion']
        },
        {
            fields: ['fecha_obtencion']
        }
    ]
});

export default CandidatoPostgradoCapacitacion;
