import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@/config/database';

// ===========================================
// INTERFACES TYPESCRIPT
// ===========================================

interface HitoSolicitudAttributes {
    id_hito_solicitud: number;
    nombre_hito: string;
    tipo_ancla: string;
    duracion_horas: number;
    avisar_antes_horas: number;
    descripcion: string;
    codigo_servicio: string;
    fecha_base?: Date;
    fecha_limite?: Date;
    fecha_cumplimiento?: Date;
    id_solicitud?: number;
}

interface HitoSolicitudCreationAttributes extends Optional<HitoSolicitudAttributes, 'id_hito_solicitud' | 'fecha_base' | 'fecha_limite' | 'fecha_cumplimiento' | 'id_solicitud'> { }

// ===========================================
// MODELO SEQUELIZE
// ===========================================

class HitoSolicitud extends Model<HitoSolicitudAttributes, HitoSolicitudCreationAttributes> implements HitoSolicitudAttributes {
    public id_hito_solicitud!: number;
    public nombre_hito!: string;
    public tipo_ancla!: string;
    public duracion_horas!: number;
    public avisar_antes_horas!: number;
    public descripcion!: string;
    public codigo_servicio!: string;
    public fecha_base?: Date;
    public fecha_limite?: Date;
    public fecha_cumplimiento?: Date;
    public id_solicitud?: number;

    // ===========================================
    // MÉTODOS PERSONALIZADOS
    // ===========================================

    /**
     * Verifica si es una plantilla (no asignado a solicitud)
     */
    public esPlantilla(): boolean {
        return this.id_solicitud === null || this.id_solicitud === undefined;
    }

    /**
     * Verifica si el hito está activo (tiene fechas asignadas)
     */
    public estaActivo(): boolean {
        return this.fecha_base !== null && this.fecha_base !== undefined &&
            this.fecha_limite !== null && this.fecha_limite !== undefined;
    }

    /**
     * Verifica si el hito está vencido (pasó la fecha límite y no está completado)
     */
    public estaVencido(): boolean {
        if (!this.estaActivo() || this.estaCompletado()) return false;
        return new Date() > this.fecha_limite!;
    }

    /**
     * Verifica si el hito está completado
     */
    public estaCompletado(): boolean {
        return this.fecha_cumplimiento !== null && this.fecha_cumplimiento !== undefined;
    }

    /**
     * Calcula cuántas horas faltan para la fecha límite
     */
    public horasRestantes(): number | null {
        if (!this.estaActivo()) return null;
        const ahora = new Date();
        const diff = this.fecha_limite!.getTime() - ahora.getTime();
        return Math.floor(diff / (1000 * 60 * 60));
    }

    /**
     * Verifica si debe enviar aviso (está en el período de aviso)
     */
    public debeAvisar(): boolean {
        if (!this.estaActivo() || this.estaCompletado()) return false;
        const horasRestantes = this.horasRestantes();
        if (horasRestantes === null) return false;
        return horasRestantes <= this.avisar_antes_horas && horasRestantes >= 0;
    }

    /**
     * Obtiene el estado del hito para el dashboard
     */
    public getEstado(): 'plantilla' | 'pendiente' | 'por_vencer' | 'vencido' | 'completado' {
        if (this.esPlantilla()) return 'plantilla';
        if (this.estaCompletado()) return 'completado';
        if (!this.estaActivo()) return 'pendiente';
        if (this.estaVencido()) return 'vencido';
        if (this.debeAvisar()) return 'por_vencer';
        return 'pendiente';
    }
}

// ===========================================
// DEFINICIÓN DEL MODELO
// ===========================================

HitoSolicitud.init({
    id_hito_solicitud: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    nombre_hito: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [3, 100]
        }
    },
    tipo_ancla: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [3, 50]
        }
    },
    duracion_horas: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },
    avisar_antes_horas: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 0
        }
    },
    descripcion: {
        type: DataTypes.STRING(500),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [5, 500]
        }
    },
    codigo_servicio: {
        type: DataTypes.STRING(2),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [2, 2]
        }
    },
    fecha_base: {
        type: DataTypes.DATE,
        allowNull: true,
        validate: {
            isDate: true
        }
    },
    fecha_limite: {
        type: DataTypes.DATE,
        allowNull: true,
        validate: {
            isDate: true
        }
    },
    fecha_cumplimiento: {
        type: DataTypes.DATE,
        allowNull: true,
        validate: {
            isDate: true
        }
    },
    id_solicitud: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'solicitud',
            key: 'id_solicitud'
        }
    }
}, {
    sequelize,
    tableName: 'hito_solicitud',
    timestamps: false,
    underscored: true,
    indexes: [
        {
            fields: ['id_solicitud']
        },
        {
            fields: ['codigo_servicio']
        },
        {
            fields: ['fecha_limite']
        },
        {
            fields: ['tipo_ancla']
        }
    ]
});

export default HitoSolicitud;

