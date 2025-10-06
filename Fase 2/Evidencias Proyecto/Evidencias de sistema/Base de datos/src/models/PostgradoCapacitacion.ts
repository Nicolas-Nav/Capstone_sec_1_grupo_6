import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@/config/database';

// ===========================================
// INTERFACES TYPESCRIPT
// ===========================================

interface PostgradoCapacitacionAttributes {
    id_postgradocapacitacion: number;
    nombre_postgradocapacitacion: string;
}

interface PostgradoCapacitacionCreationAttributes
    extends Optional<PostgradoCapacitacionAttributes, 'id_postgradocapacitacion'> { }

// ===========================================
// MODELO SEQUELIZE
// ===========================================

class PostgradoCapacitacion
    extends Model<PostgradoCapacitacionAttributes, PostgradoCapacitacionCreationAttributes>
    implements PostgradoCapacitacionAttributes {

    public id_postgradocapacitacion!: number;
    public nombre_postgradocapacitacion!: string;
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
    }
}, {
    sequelize,
    tableName: 'postgradocapacitacion',
    timestamps: false,
    underscored: true
});

export default PostgradoCapacitacion;
