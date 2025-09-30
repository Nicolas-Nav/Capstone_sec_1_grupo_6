import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@/config/database';

// ===========================================
// INTERFACES TYPESCRIPT
// ===========================================

interface InstitucionAttributes {
  id_institucion: number;
  nombre_institucion: string;
  created_at?: Date;
  updated_at?: Date;
}

interface InstitucionCreationAttributes extends Optional<InstitucionAttributes, 'id_institucion' | 'created_at' | 'updated_at'> {}

// ===========================================
// MODELO SEQUELIZE
// ===========================================

class Institucion extends Model<InstitucionAttributes, InstitucionCreationAttributes> implements InstitucionAttributes {
  public id_institucion!: number;
  public nombre_institucion!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

// ===========================================
// DEFINICIÓN DEL MODELO
// ===========================================

Institucion.init({
  id_institucion: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  nombre_institucion: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El nombre de la institución es requerido'
      },
      len: {
        args: [2, 100],
        msg: 'El nombre debe tener entre 2 y 100 caracteres'
      }
    }
  }
}, {
  sequelize,
  tableName: 'institucion',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['nombre_institucion']
    }
  ]
});

export default Institucion;
