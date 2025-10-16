import { Model, DataTypes } from 'sequelize';
import sequelize from '@/config/database';

// ===========================================
// INTERFACES TYPESCRIPT
// ===========================================

interface EvaluacionTestAttributes {
    id_evaluacion_psicolaboral: number;
    id_test_psicolaboral: number;
    resultado_test: string;
}

// ===========================================
// MODELO SEQUELIZE
// ===========================================

class EvaluacionTest extends Model<EvaluacionTestAttributes> implements EvaluacionTestAttributes {
    public id_evaluacion_psicolaboral!: number;
    public id_test_psicolaboral!: number;
    public resultado_test!: string;
}

// ===========================================
// DEFINICIÓN DEL MODELO
// ===========================================

EvaluacionTest.init({
    id_evaluacion_psicolaboral: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
            model: 'evaluacion_psicolaboral',
            key: 'id_evaluacion_psicolaboral'
        }
    },
    id_test_psicolaboral: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
            model: 'test_psicolaboral',
            key: 'id_test_psicolaboral'
        }
    },
    resultado_test: {
        type: DataTypes.STRING(300),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [5, 300]
        }
    }
}, {
    sequelize,
    tableName: 'evaluaciontest',
    timestamps: false,
    underscored: true,
    indexes: [
        {
            fields: ['id_evaluacion_psicolaboral']
        },
        {
            fields: ['id_test_psicolaboral']
        }
    ]
});

export default EvaluacionTest;

