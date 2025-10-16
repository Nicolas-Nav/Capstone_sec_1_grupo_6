import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@/config/database';

// ===========================================
// INTERFACES TYPESCRIPT
// ===========================================

interface ReferenciaLaboralAttributes {
    id_referencia_laboral: number;
    nombre_jefe_referencia: string;
    cargo_jefe_referencia: string;
    empresa_referencia: string;
    telefono_referencia: string;
    email_referencia: string;
    id_candidato: number;
}

interface ReferenciaLaboralCreationAttributes extends Optional<ReferenciaLaboralAttributes, 'id_referencia_laboral'> { }

// ===========================================
// MODELO SEQUELIZE
// ===========================================

class ReferenciaLaboral extends Model<ReferenciaLaboralAttributes, ReferenciaLaboralCreationAttributes> implements ReferenciaLaboralAttributes {
    public id_referencia_laboral!: number;
    public nombre_jefe_referencia!: string;
    public cargo_jefe_referencia!: string;
    public empresa_referencia!: string;
    public telefono_referencia!: string;
    public email_referencia!: string;
    public id_candidato!: number;

    // ===========================================
    // MÉTODOS PERSONALIZADOS
    // ===========================================

    /**
     * Obtiene el nombre completo de la referencia
     */
    public getReferenciaCompleta(): string {
        return `${this.nombre_jefe_referencia} - ${this.cargo_jefe_referencia} en ${this.empresa_referencia}`;
    }
}

// ===========================================
// DEFINICIÓN DEL MODELO
// ===========================================

ReferenciaLaboral.init({
    id_referencia_laboral: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    nombre_jefe_referencia: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [2, 100]
        }
    },
    cargo_jefe_referencia: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [2, 100]
        }
    },
    empresa_referencia: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [2, 100]
        }
    },
    telefono_referencia: {
        type: DataTypes.STRING(12),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [8, 12]
        }
    },
    email_referencia: {
        type: DataTypes.STRING(256),
        allowNull: false,
        validate: {
            isEmail: true,
            notEmpty: true
        }
    },
    id_candidato: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'candidato',
            key: 'id_candidato'
        }
    }
}, {
    sequelize,
    tableName: 'referenciaslaboral',
    timestamps: false,
    underscored: true,
    indexes: [
        {
            fields: ['id_candidato']
        }
    ]
});

export default ReferenciaLaboral;

