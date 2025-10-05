import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@/config/database';

// ===========================================
// INTERFACES TYPESCRIPT
// ===========================================

interface CandidatoProfesionAttributes {
    fecha_obtencion: Date;
    id_profesion: number;
    id_candidato: number;
    id_institucion?: number | null; // nueva FK opcional
}

interface CandidatoProfesionCreationAttributes
    extends Optional<CandidatoProfesionAttributes, 'fecha_obtencion'> { }

// ===========================================
// MODELO SEQUELIZE
// ===========================================

class CandidatoProfesion
    extends Model<CandidatoProfesionAttributes, CandidatoProfesionCreationAttributes>
    implements CandidatoProfesionAttributes {

    public fecha_obtencion!: Date;
    public id_profesion!: number;
    public id_candidato!: number;
    public id_institucion?: number | null;
}

// ===========================================
// DEFINICIÓN DEL MODELO
// ===========================================

CandidatoProfesion.init({
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
    id_profesion: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
            model: 'profesion',
            key: 'id_profesion'
        },
        validate: {
            notNull: {
                msg: 'La profesión es requerida'
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
        allowNull: true, // opcional
        references: {
            model: 'institucion',
            key: 'id_institucion'
        }
    }
}, {
    sequelize,
    tableName: 'candidatoprofesion',
    timestamps: false,
    underscored: true,
    indexes: [
        {
            fields: ['id_profesion']
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

export default CandidatoProfesion;
