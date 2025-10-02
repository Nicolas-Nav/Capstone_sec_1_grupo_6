import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@/config/database';

// ===========================================
// INTERFACES TYPESCRIPT
// ===========================================

interface ComunaAttributes {
  id_comuna: number;
  nombre_comuna: string;
  id_region: number;
}

interface ComunaCreationAttributes extends Optional<ComunaAttributes, 'id_comuna'> {}

// ===========================================
// MODELO SEQUELIZE
// ===========================================

class Comuna extends Model<ComunaAttributes, ComunaCreationAttributes> implements ComunaAttributes {
  public id_comuna!: number;
  public nombre_comuna!: string;
  public id_region!: number;
}

// ===========================================
// DEFINICIÓN DEL MODELO
// ===========================================

Comuna.init({
  id_comuna: {
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
  timestamps: false,
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
