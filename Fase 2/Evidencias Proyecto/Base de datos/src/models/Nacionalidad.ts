import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@/config/database';

// ===========================================
// INTERFACES TYPESCRIPT
// ===========================================

interface NacionalidadAttributes {
  id_nacionalidad: number;
  nombre_nacionalidad: string;
  created_at?: Date;
  updated_at?: Date;
}

interface NacionalidadCreationAttributes extends Optional<NacionalidadAttributes, 'id_nacionalidad' | 'created_at' | 'updated_at'> {}

// ===========================================
// MODELO SEQUELIZE
// ===========================================

class Nacionalidad extends Model<NacionalidadAttributes, NacionalidadCreationAttributes> implements NacionalidadAttributes {
  public id_nacionalidad!: number;
  public nombre_nacionalidad!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

// ===========================================
// DEFINICIÓN DEL MODELO
// ===========================================

Nacionalidad.init({
  id_nacionalidad: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  nombre_nacionalidad: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El nombre de la nacionalidad es requerido'
      },
      len: {
        args: [2, 100],
        msg: 'El nombre debe tener entre 2 y 100 caracteres'
      }
    }
  }
}, {
  sequelize,
  tableName: 'nacionalidad',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['nombre_nacionalidad']
    }
  ]
});

export default Nacionalidad;
