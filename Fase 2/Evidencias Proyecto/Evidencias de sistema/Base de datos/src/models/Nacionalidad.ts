import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@/config/database';

// ===========================================
// INTERFACES TYPESCRIPT
// ===========================================

interface NacionalidadAttributes {
    id_nacionalidad: number;
    nombre_nacionalidad: string;
}

interface NacionalidadCreationAttributes extends Optional<NacionalidadAttributes, 'id_nacionalidad'> { }

// ===========================================
// MODELO SEQUELIZE
// ===========================================

class Nacionalidad extends Model<NacionalidadAttributes, NacionalidadCreationAttributes> implements NacionalidadAttributes {
    public id_nacionalidad!: number;
    public nombre_nacionalidad!: string;
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
    timestamps: false,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['nombre_nacionalidad']
        }
    ]
});

export default Nacionalidad;
