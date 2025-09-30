import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@/config/database';

// ===========================================
// INTERFACES TYPESCRIPT
// ===========================================

interface RubroAttributes {
  id_rubro: number;
  nombre_rubro: string;
}

interface RubroCreationAttributes extends Optional<RubroAttributes, 'id_rubro'> {}

// ===========================================
// MODELO SEQUELIZE
// ===========================================

class Rubro extends Model<RubroAttributes, RubroCreationAttributes> implements RubroAttributes {
  public id_rubro!: number;
  public nombre_rubro!: string;

  // ===========================================
  // MÉTODOS PERSONALIZADOS
  // ===========================================

  /**
   * Obtiene el nombre del rubro formateado
   */
  public getNombreFormateado(): string {
    return this.nombre_rubro.trim();
  }
}

// ===========================================
// DEFINICIÓN DEL MODELO
// ===========================================

Rubro.init({
  id_rubro: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  nombre_rubro: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El nombre del rubro es requerido'
      },
      len: {
        args: [2, 100],
        msg: 'El nombre debe tener entre 2 y 100 caracteres'
      }
    }
  }
}, {
  sequelize,
  tableName: 'rubro',
  timestamps: false,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['nombre_rubro']
    }
  ]
});

export default Rubro;
