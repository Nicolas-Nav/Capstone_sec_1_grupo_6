import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@/config/database';

// ===========================================
// INTERFACES TYPESCRIPT
// ===========================================

interface TestPsicolaboralAttributes {
    id_test_psicolaboral: number;
    nombre_test_psicolaboral: string;
    descripcion_test_psicolaboral: string;
}

interface TestPsicolaboralCreationAttributes extends Optional<TestPsicolaboralAttributes, 'id_test_psicolaboral'> { }

// ===========================================
// MODELO SEQUELIZE
// ===========================================

class TestPsicolaboral extends Model<TestPsicolaboralAttributes, TestPsicolaboralCreationAttributes> implements TestPsicolaboralAttributes {
    public id_test_psicolaboral!: number;
    public nombre_test_psicolaboral!: string;
    public descripcion_test_psicolaboral!: string;
}

// ===========================================
// DEFINICIÓN DEL MODELO
// ===========================================

TestPsicolaboral.init({
    id_test_psicolaboral: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    nombre_test_psicolaboral: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true,
            len: [3, 100]
        }
    },
    descripcion_test_psicolaboral: {
        type: DataTypes.STRING(300),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [10, 300]
        }
    }
}, {
    sequelize,
    tableName: 'test_psicolaboral',
    timestamps: false,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['nombre_test_psicolaboral']
        }
    ]
});

export default TestPsicolaboral;

