import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@/config/database';

// ===========================================
// INTERFACES TYPESCRIPT
// ===========================================

interface RegionAttributes {
    id_region: number;
    nombre_region: string;
    created_at?: Date;
    updated_at?: Date;
}

interface RegionCreationAttributes extends Optional<RegionAttributes, 'id_region' | 'created_at' | 'updated_at'> { }

// ===========================================
// MODELO SEQUELIZE
// ===========================================

class Region extends Model<RegionAttributes, RegionCreationAttributes> implements RegionAttributes {
    public id_region!: number;
    public nombre_region!: string;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

// ===========================================
// DEFINICIÓN DEL MODELO
// ===========================================

Region.init({
    id_region: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    nombre_region: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'El nombre de la región es requerido'
            },
            len: {
                args: [2, 100],
                msg: 'El nombre debe tener entre 2 y 100 caracteres'
            }
        }
    }
}, {
    sequelize,
    tableName: 'region',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['nombre_region']
        }
    ]
});

export default Region;
