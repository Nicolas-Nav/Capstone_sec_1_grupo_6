import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@/config/database';

// ===========================================
// INTERFACES TYPESCRIPT
// ===========================================

interface CandidatoProfesionAttributes {
  fecha_obtencion: Date;
  id_profesion: number;
  id_candidato: number;
  created_at?: Date;
  updated_at?: Date;
}

interface CandidatoProfesionCreationAttributes extends Optional<CandidatoProfesionAttributes, 'created_at' | 'updated_at'> {}

// ===========================================
// MODELO SEQUELIZE
// ===========================================

class CandidatoProfesion extends Model<CandidatoProfesionAttributes, CandidatoProfesionCreationAttributes> implements CandidatoProfesionAttributes {
  public fecha_obtencion!: Date;
  public id_profesion!: number;
  public id_candidato!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
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
  }
}, {
  sequelize,
  tableName: 'candidatoprofesion',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true,
  indexes: [
    {
      fields: ['id_profesion']
    },
    {
      fields: ['id_candidato']
    },
    {
      fields: ['fecha_obtencion']
    }
  ]
});

export default CandidatoProfesion;
