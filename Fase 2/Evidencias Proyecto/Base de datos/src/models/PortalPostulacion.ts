import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@/config/database';

// ===========================================
// INTERFACES TYPESCRIPT
// ===========================================

interface PortalPostulacionAttributes {
  id_portal_postulacion: number;
  nombre_portal_postulacion: string;
}

interface PortalPostulacionCreationAttributes extends Optional<PortalPostulacionAttributes, 'id_portal_postulacion'> {}

// ===========================================
// MODELO SEQUELIZE
// ===========================================

class PortalPostulacion extends Model<PortalPostulacionAttributes, PortalPostulacionCreationAttributes> implements PortalPostulacionAttributes {
  public id_portal_postulacion!: number;
  public nombre_portal_postulacion!: string;

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
  timestamps: false,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['nombre_portal_postulacion']
    }
  ]
});

export default PortalPostulacion;