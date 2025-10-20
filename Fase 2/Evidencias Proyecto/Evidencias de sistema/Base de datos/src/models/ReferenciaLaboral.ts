import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@/config/database';

// ===========================================
// INTERFACES TYPESCRIPT
// ===========================================

interface ReferenciaLaboralAttributes {
    id_referencia_laboral: number;
    nombre_referencia: string;
    cargo_referencia: string;
    empresa_referencia: string;
    telefono_referencia: string;
    email_referencia: string;
    id_candidato: number;
    relacion_postulante_referencia: string;
    comentario_referencia?: string;
}

interface ReferenciaLaboralCreationAttributes extends Optional<ReferenciaLaboralAttributes, 'id_referencia_laboral' | 'comentario_referencia'> { }

// ===========================================
// MODELO SEQUELIZE
// ===========================================

class ReferenciaLaboral extends Model<ReferenciaLaboralAttributes, ReferenciaLaboralCreationAttributes> implements ReferenciaLaboralAttributes {
    public id_referencia_laboral!: number;
    public nombre_referencia!: string;
    public cargo_referencia!: string;
    public empresa_referencia!: string;
    public telefono_referencia!: string;
    public email_referencia!: string;
    public id_candidato!: number;
    public relacion_postulante_referencia!: string;
    public comentario_referencia?: string;

    // ===========================================
    // MÉTODOS PERSONALIZADOS
    // ===========================================

    /**
     * Obtiene el nombre completo de la referencia
     */
    public getReferenciaCompleta(): string {
        return `${this.nombre_referencia} - ${this.cargo_referencia} en ${this.empresa_referencia}`;
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
    nombre_referencia: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [2, 100]
        }
    },
    cargo_referencia: {
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
    },
    relacion_postulante_referencia: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [2, 100]
        }
    },
    comentario_referencia: {
        type: DataTypes.TEXT,
        allowNull: true
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

