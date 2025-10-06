import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@/config/database';

// ===========================================
// INTERFACES TYPESCRIPT
// ===========================================

interface CargoAttributes {
    id_cargo: number;
    nombre_cargo: string;
}

interface CargoCreationAttributes extends Optional<CargoAttributes, 'id_cargo'> { }

// ===========================================
// MODELO SEQUELIZE
// ===========================================

class Cargo extends Model<CargoAttributes, CargoCreationAttributes> implements CargoAttributes {
    public id_cargo!: number;
    public nombre_cargo!: string;

    // ===========================================
    // MÉTODOS PERSONALIZADOS
    // ===========================================

    /**
     * Obtiene el nombre del cargo formateado
     */
    public getNombreFormateado(): string {
        return this.nombre_cargo.trim();
    }
}

// ===========================================
// DEFINICIÓN DEL MODELO
// ===========================================

Cargo.init({
    id_cargo: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    nombre_cargo: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'El nombre del cargo es requerido'
            },
            len: {
                args: [2, 100],
                msg: 'El nombre debe tener entre 2 y 100 caracteres'
            }
        }
    }
}, {
    sequelize,
    tableName: 'cargo',
    timestamps: false,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['nombre_cargo']
        }
    ]
});

export default Cargo;
