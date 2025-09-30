import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@/config/database';

// ===========================================
// INTERFACES TYPESCRIPT
// ===========================================

interface PortalPostulacionAttributes {
  id_portal_postulacion: number;
  nombre_portal_postulacion: string;
  created_at?: Date;
  updated_at?: Date;
}

interface PortalPostulacionCreationAttributes extends Optional<PortalPostulacionAttributes, 'id_portal_postulacion' | 'created_at' | 'updated_at'> {}

// ===========================================
// MODELO SEQUELIZE
// ===========================================

class PortalPostulacion extends Model<PortalPostulacionAttributes, PortalPostulacionCreationAttributes> implements PortalPostulacionAttributes {
  public id_portal_postulacion!: number;
  public nombre_portal_postulacion!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // ===========================================
  // MÉTODOS PERSONALIZADOS
  // ===========================================

  /**
   * Obtiene el nombre del portal formateado
   */
  public getNombreFormateado(): string {
    return this.nombre_portal_postulacion.trim();
  }

}

// ===========================================
// DEFINICIÓN DEL MODELO
// ===========================================

PortalPostulacion.init({
  id_portal_postulacion: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  nombre_portal_postulacion: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El nombre del portal es requerido'
      },
      len: {
        args: [2, 100],
        msg: 'El nombre debe tener entre 2 y 100 caracteres'
      }
    }
  }
}, {
  sequelize,
  tableName: 'portal_postulacion',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['nombre_portal_postulacion']
    }
  ]
});

export default PortalPostulacion;