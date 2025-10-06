import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@/config/database';

// ===========================================
// INTERFACES TYPESCRIPT
// ===========================================

interface ProfesionAttributes {
    id_profesion: number;
    nombre_profesion: string;
}

interface ProfesionCreationAttributes extends Optional<ProfesionAttributes, 'id_profesion'> { }

// ===========================================
// MODELO SEQUELIZE
// ===========================================

class Profesion extends Model<ProfesionAttributes, ProfesionCreationAttributes> implements ProfesionAttributes {
    public id_profesion!: number;
    public nombre_profesion!: string;
}

// ===========================================
// DEFINICIÓN DEL MODELO
// ===========================================

Profesion.init({
    id_profesion: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    nombre_profesion: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'El nombre de la profesión es requerido'
            },
            len: {
                args: [2, 100],
                msg: 'El nombre debe tener entre 2 y 100 caracteres'
            }
        }
    }
}, {
    sequelize,
    tableName: 'profesion',
    timestamps: false,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['nombre_profesion']
        }
    ]
});

export default Profesion;