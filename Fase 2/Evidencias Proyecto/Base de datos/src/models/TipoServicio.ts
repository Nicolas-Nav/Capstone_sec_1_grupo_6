import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@/config/database';

// ===========================================
// INTERFACES TYPESCRIPT
// ===========================================

interface TipoServicioAttributes {
    codigo_servicio: string;
    nombre_servicio: string;
}

interface TipoServicioCreationAttributes extends Optional<TipoServicioAttributes, 'codigo_servicio'> { }

// ===========================================
// MODELO SEQUELIZE
// ===========================================

class TipoServicio extends Model<TipoServicioAttributes, TipoServicioCreationAttributes> implements TipoServicioAttributes {
    public codigo_servicio!: string;
    public nombre_servicio!: string;

    // ===========================================
    // MÉTODOS PERSONALIZADOS
    // ===========================================

    /**
     * Obtiene el nombre del servicio formateado
     */
    public getNombreFormateado(): string {
        return this.nombre_servicio.trim();
    }
}

// ===========================================
// DEFINICIÓN DEL MODELO
// ===========================================

TipoServicio.init({
    codigo_servicio: {
        type: DataTypes.STRING(2),
        primaryKey: true,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'El código del servicio es requerido'
            },
            len: {
                args: [2, 2],
                msg: 'El código debe tener exactamente 2 caracteres'
            }
        }
    },
    nombre_servicio: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'El nombre del servicio es requerido'
            },
            len: {
                args: [2, 100],
                msg: 'El nombre debe tener entre 2 y 100 caracteres'
            }
        }
    }
}, {
    sequelize,
    tableName: 'tiposervicio',
    timestamps: false,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['nombre_servicio']
        }
    ]
});

export default TipoServicio;
