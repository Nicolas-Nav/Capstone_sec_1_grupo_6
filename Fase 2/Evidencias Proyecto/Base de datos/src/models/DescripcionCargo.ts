import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@/config/database';
import { validateDateRange } from '@/utils/validators';

// ===========================================
// INTERFACES TYPESCRIPT
// ===========================================

interface DescripcionCargoAttributes {
    id_descripcioncargo: number;
    descripcion_cargo: string;
    requisitos_y_condiciones: string;
    num_vacante: number;
    fecha_ingreso: Date;
    datos_excel?: object; 
    id_cargo: number;
    id_comuna: number;
}

interface DescripcionCargoCreationAttributes extends Optional<DescripcionCargoAttributes, 'id_descripcioncargo' | 'datos_excel'> { }

// ===========================================
// MODELO SEQUELIZE
// ===========================================

class DescripcionCargo extends Model<DescripcionCargoAttributes, DescripcionCargoCreationAttributes> implements DescripcionCargoAttributes {
    public id_descripcioncargo!: number;
    public descripcion_cargo!: string;
    public requisitos_y_condiciones!: string;
    public num_vacante!: number;
    public fecha_ingreso!: Date;
    public datos_excel?: object; 
    public id_cargo!: number;
    public id_comuna!: number;

    // ===========================================
    // MÉTODOS PERSONALIZADOS
    // ===========================================

    /**
     * Verifica si hay vacantes disponibles
     */
    public tieneVacantes(): boolean {
        return this.num_vacante > 0;
    }

    /**
     * Obtiene la descripción formateada
     */
    public getDescripcionFormateada(): string {
        return this.descripcion_cargo.trim();
    }

    /**
     * Verifica si la fecha de ingreso es futura
     */
    public esFechaFutura(): boolean {
        return this.fecha_ingreso > new Date();
    }

    /**
     * Verifica si tiene datos de Excel cargados
     */
    public tieneDatosExcel(): boolean {
        return this.datos_excel !== null && this.datos_excel !== undefined;
    }

    /**
     * Obtiene los datos de Excel como JSON
     */
    public getDatosExcel(): object | null {
        return this.datos_excel || null;
    }

    /**
     * Obtiene una hoja específica de los datos Excel
     */
    public getHojaExcel(nombreHoja: string): any[] | null {
        if (!this.datos_excel || typeof this.datos_excel !== 'object') {
            return null;
        }

        const datos = this.datos_excel as any;
        return datos[nombreHoja] || null;
    }
}

// ===========================================
// DEFINICIÓN DEL MODELO
// ===========================================

DescripcionCargo.init({
    id_descripcioncargo: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    descripcion_cargo: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [10, 100]
        }
    },
    requisitos_y_condiciones: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: 'Por definir',
        validate: {
            len: [0, 100]
        }
    },
    num_vacante: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 100
        }
    },
    fecha_ingreso: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
            isDate: true,
            isValidDateRange(value: Date) {
                if (!validateDateRange(value, 14)) {
                    throw new Error('La fecha de ingreso debe ser desde 2 semanas atrás hasta el futuro');
                }
            }
        }
    },
    datos_excel: {
        type: DataTypes.JSON, 
        allowNull: true,
        validate: {
            isValidJson(value: any) {
                if (value && typeof value !== 'object') {
                    throw new Error('Los datos Excel deben ser un objeto JSON válido');
                }
            }
        }
    },
    id_cargo: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'cargo',
            key: 'id_cargo'
        },
        validate: {
            notNull: {
                msg: 'El cargo es requerido'
            }
        }
    },
    id_comuna: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'comuna',
            key: 'id_comuna'
        },
        validate: {
            notNull: {
                msg: 'La comuna es requerida'
            }
        }
    }
}, {
    sequelize,
    tableName: 'descripcioncargo',
    timestamps: false,
    underscored: true,
    indexes: [
        {
            fields: ['id_cargo']
        },
        {
            fields: ['id_comuna']
        },
        {
            fields: ['fecha_ingreso']
        }
    ]
});

export default DescripcionCargo;