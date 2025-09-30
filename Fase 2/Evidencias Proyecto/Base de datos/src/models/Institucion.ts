import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@/config/database';

// ===========================================
// INTERFACES TYPESCRIPT
// ===========================================

interface InstitucionAttributes {
    id_institucion: number;
    nombre_institucion: string;
}

interface InstitucionCreationAttributes extends Optional<InstitucionAttributes, 'id_institucion'> { }

// ===========================================
// MODELO SEQUELIZE
// ===========================================

class Institucion extends Model<InstitucionAttributes, InstitucionCreationAttributes> implements InstitucionAttributes {
    public id_institucion!: number;
    public nombre_institucion!: string;
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
    timestamps: false,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['nombre_institucion']
        }
    ]
});

export default Institucion;
