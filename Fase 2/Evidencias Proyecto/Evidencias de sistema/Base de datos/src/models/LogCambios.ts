import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@/config/database';

// ===========================================
// INTERFACES TYPESCRIPT
// ===========================================

interface LogCambiosAttributes {
    id_log: number;
    tabla_afectada: string;
    id_registro: string;
    accion: string;
    detalle_cambio: string;
    fecha_cambio: Date;
    usuario_responsable: string;
}

interface LogCambiosCreationAttributes extends Optional<LogCambiosAttributes, 'id_log' | 'fecha_cambio'> { }

// ===========================================
// MODELO SEQUELIZE
// ===========================================

class LogCambios extends Model<LogCambiosAttributes, LogCambiosCreationAttributes> implements LogCambiosAttributes {
    public id_log!: number;
    public tabla_afectada!: string;
    public id_registro!: string;
    public accion!: string;
    public detalle_cambio!: string;
    public fecha_cambio!: Date;
    public usuario_responsable!: string;

    // ===========================================
    // MÉTODOS PERSONALIZADOS
    // ===========================================

    /**
     * Obtiene una descripción legible del cambio
     */
    public getDescripcionCompleta(): string {
        return `${this.accion} en ${this.tabla_afectada} (ID: ${this.id_registro}) - ${this.detalle_cambio}`;
    }

    /**
     * Verifica si es una acción de inserción
     */
    public esInsercion(): boolean {
        return this.accion.toLowerCase() === 'insert' || this.accion.toLowerCase() === 'insertar';
    }

    /**
     * Verifica si es una acción de actualización
     */
    public esActualizacion(): boolean {
        return this.accion.toLowerCase() === 'update' || this.accion.toLowerCase() === 'actualizar';
    }

    /**
     * Verifica si es una acción de eliminación
     */
    public esEliminacion(): boolean {
        return this.accion.toLowerCase() === 'delete' || this.accion.toLowerCase() === 'eliminar';
    }
}

// ===========================================
// DEFINICIÓN DEL MODELO
// ===========================================

LogCambios.init({
    id_log: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    tabla_afectada: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [3, 100]
        }
    },
    id_registro: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    accion: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [3, 20],
            isIn: {
                args: [['INSERT', 'UPDATE', 'DELETE', 'Insertar', 'Actualizar', 'Eliminar']],
                msg: 'Acción inválida'
            }
        }
    },
    detalle_cambio: {
        type: DataTypes.STRING(1000),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [5, 1000]
        }
    },
    fecha_cambio: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        validate: {
            isDate: true
        }
    },
    usuario_responsable: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            notEmpty: true
        }
    }
}, {
    sequelize,
    tableName: 'log_cambios',
    timestamps: false,
    underscored: true,
    indexes: [
        {
            fields: ['tabla_afectada']
        },
        {
            fields: ['fecha_cambio']
        },
        {
            fields: ['usuario_responsable']
        },
        {
            fields: ['accion']
        }
    ]
});

export default LogCambios;

