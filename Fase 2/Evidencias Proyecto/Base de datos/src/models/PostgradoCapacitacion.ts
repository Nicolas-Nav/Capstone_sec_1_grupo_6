import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@/config/database';

// ===========================================
// INTERFACES TYPESCRIPT
// ===========================================

interface PostgradoCapacitacionAttributes {
  id_postgradocapacitacion: number;
  nombre_postgradocapacitacion: string;
  id_institucion: number;
  created_at?: Date;
  updated_at?: Date;
}

interface PostgradoCapacitacionCreationAttributes extends Optional<PostgradoCapacitacionAttributes, 'id_postgradocapacitacion' | 'created_at' | 'updated_at'> {}

// ===========================================
// MODELO SEQUELIZE
// ===========================================

class PostgradoCapacitacion extends Model<PostgradoCapacitacionAttributes, PostgradoCapacitacionCreationAttributes> implements PostgradoCapacitacionAttributes {
  public id_postgradocapacitacion!: number;
  public nombre_postgradocapacitacion!: string;
  public id_institucion!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

// ===========================================
// DEFINICIÓN DEL MODELO
// ===========================================

PostgradoCapacitacion.init({
  id_postgradocapacitacion: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  nombre_postgradocapacitacion: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El nombre del postgrado/capacitación es requerido'
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
  tableName: 'postgradocapacitacion',
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
      fields: ['nombre_postgradocapacitacion', 'id_institucion']
    }
  ]
});

export default PostgradoCapacitacion;
