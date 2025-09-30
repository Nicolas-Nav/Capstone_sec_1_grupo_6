import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@/config/database';

// ===========================================
// INTERFACES TYPESCRIPT
// ===========================================

interface ProfesionAttributes {
  id_profesion: number;
  nombre_profesion: string;
  id_institucion: number;
  created_at?: Date;
  updated_at?: Date;
}

interface ProfesionCreationAttributes extends Optional<ProfesionAttributes, 'id_profesion' | 'created_at' | 'updated_at'> {}

// ===========================================
// MODELO SEQUELIZE
// ===========================================

class Profesion extends Model<ProfesionAttributes, ProfesionCreationAttributes> implements ProfesionAttributes {
  public id_profesion!: number;
  public nombre_profesion!: string;
  public id_institucion!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

// ===========================================
// DEFINICIÓN DEL MODELO
// ===========================================

Profesion.init({
  id_profesion: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  nombre_profesion: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El nombre de la profesión es requerido'
      },
      len: {
        args: [2, 100],
        msg: 'El nombre debe tener entre 2 y 100 caracteres'
      }
    }
  },
  id_institucion: {
    type: DataTypes.INTEGER,
    allowNull: false,
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
  tableName: 'profesion',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true,
  indexes: [
    {
      fields: ['id_institucion']
    },
    {
      unique: true,
      fields: ['nombre_profesion', 'id_institucion']
    }
  ]
});

export default Profesion;
