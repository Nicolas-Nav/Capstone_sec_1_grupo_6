import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@/config/database';

// ===========================================
// INTERFACES TYPESCRIPT
// ===========================================

interface ComunaAttributes {
  id_ciudad: number;
  nombre_comuna: string;
  id_region: number;
  created_at?: Date;
  updated_at?: Date;
}

interface ComunaCreationAttributes extends Optional<ComunaAttributes, 'id_ciudad' | 'created_at' | 'updated_at'> {}

// ===========================================
// MODELO SEQUELIZE
// ===========================================

class Comuna extends Model<ComunaAttributes, ComunaCreationAttributes> implements ComunaAttributes {
  public id_ciudad!: number;
  public nombre_comuna!: string;
  public id_region!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

// ===========================================
// DEFINICIÓN DEL MODELO
// ===========================================

Comuna.init({
  id_ciudad: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  nombre_comuna: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El nombre de la comuna es requerido'
      },
      len: {
        args: [2, 100],
        msg: 'El nombre debe tener entre 2 y 100 caracteres'
      }
    }
  },
  id_region: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'region',
      key: 'id_region'
    },
    validate: {
      notNull: {
        msg: 'La región es requerida'
      }
    }
  }
}, {
  sequelize,
  tableName: 'comuna',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true,
  indexes: [
    {
      fields: ['id_region']
    },
    {
      unique: true,
      fields: ['nombre_comuna', 'id_region']
    }
  ]
});

export default Comuna;
