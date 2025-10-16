import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@/config/database';

// ===========================================
// INTERFACES TYPESCRIPT
// ===========================================

interface EstadoSolicitudAttributes {
    id_estado_solicitud: number;
    nombre_estado_solicitud: string;
}

interface EstadoSolicitudCreationAttributes extends Optional<EstadoSolicitudAttributes, 'id_estado_solicitud'> { }

// ===========================================
// MODELO SEQUELIZE
// ===========================================

class EstadoSolicitud extends Model<EstadoSolicitudAttributes, EstadoSolicitudCreationAttributes> implements EstadoSolicitudAttributes {
    public id_estado_solicitud!: number;
    public nombre_estado_solicitud!: string;

    // ===========================================
    // MÉTODOS PERSONALIZADOS
    // ===========================================

    /**
     * Verifica si el estado es activo (Abierto, En Progreso)
     */
    public esActivo(): boolean {
        const nombreEstado = this.nombre_estado_solicitud.toLowerCase();
        return nombreEstado === 'abierto' || nombreEstado === 'en progreso';
    }

    /**
     * Verifica si el estado es final (Cerrado, Congelado, Cancelado, Cierre Extraordinario)
     */
    public esFinal(): boolean {
        const nombreEstado = this.nombre_estado_solicitud.toLowerCase();
        return nombreEstado === 'cerrado' || nombreEstado === 'congelado' || 
               nombreEstado === 'cancelado' || nombreEstado === 'cierre extraordinario';
    }

    /**
     * Verifica si el estado es abierto
     */
    public esAbierto(): boolean {
        return this.nombre_estado_solicitud.toLowerCase() === 'abierto';
    }

    /**
     * Verifica si el estado es en progreso
     */
    public esEnProgreso(): boolean {
        return this.nombre_estado_solicitud.toLowerCase() === 'en progreso';
    }

    /**
     * Verifica si el estado es cerrado
     */
    public esCerrado(): boolean {
        return this.nombre_estado_solicitud.toLowerCase() === 'cerrado';
    }

    /**
     * Verifica si el estado es congelado
     */
    public esCongelado(): boolean {
        return this.nombre_estado_solicitud.toLowerCase() === 'congelado';
    }

    /**
     * Verifica si el estado es cancelado
     */
    public esCancelado(): boolean {
        return this.nombre_estado_solicitud.toLowerCase() === 'cancelado';
    }

    /**
     * Verifica si el estado es cierre extraordinario
     */
    public esCierreExtraordinario(): boolean {
        return this.nombre_estado_solicitud.toLowerCase() === 'cierre extraordinario';
    }

    /**
     * Obtiene el nombre del estado formateado
     */
    public getNombreFormateado(): string {
        return this.nombre_estado_solicitud.trim();
    }

    /**
     * Obtiene información completa del estado para la interfaz
     */
    public getInfoInterfaz(): {
        nombre: string;
        activo: boolean;
        final: boolean;
        abierto: boolean;
        enProgreso: boolean;
        cerrado: boolean;
        congelado: boolean;
        cancelado: boolean;
        cierreExtraordinario: boolean;
    } {
        return {
            nombre: this.getNombreFormateado(),
            activo: this.esActivo(),
            final: this.esFinal(),
            abierto: this.esAbierto(),
            enProgreso: this.esEnProgreso(),
            cerrado: this.esCerrado(),
            congelado: this.esCongelado(),
            cancelado: this.esCancelado(),
            cierreExtraordinario: this.esCierreExtraordinario()
        };
    }

    /**
     * Obtiene los estados disponibles para transición
     */
    public getEstadosDisponibles(): string[] {
        const nombreEstado = this.nombre_estado_solicitud.toLowerCase();

        switch (nombreEstado) {
            case 'abierto':
                return ['en progreso', 'cerrado', 'congelado', 'cancelado', 'cierre extraordinario'];
            case 'en progreso':
                return ['cerrado', 'congelado', 'cancelado', 'cierre extraordinario'];
            case 'cerrado':
                return []; // Estado final
            case 'congelado':
                return ['cerrado', 'en progreso', 'cancelado', 'cierre extraordinario']; // Se puede descongelar
            case 'cancelado':
                return []; // Estado final
            case 'cierre extraordinario':
                return []; // Estado final
            default:
                return [];
        }
    }

    /**
     * Verifica si se puede cambiar a un estado específico
     */
    public puedeCambiarA(nuevoEstado: string): boolean {
        const estadosDisponibles = this.getEstadosDisponibles();
        return estadosDisponibles.includes(nuevoEstado.toLowerCase());
    }
}

// ===========================================
// DEFINICIÓN DEL MODELO
// ===========================================

EstadoSolicitud.init({
    id_estado_solicitud: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    nombre_estado_solicitud: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'El nombre del estado es requerido'
            },
            len: {
                args: [2, 100],
                msg: 'El nombre debe tener entre 2 y 100 caracteres'
            }
        }
    }
}, {
    sequelize,
    tableName: 'estado',
    timestamps: false,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['nombre_estado_solicitud']
        }
    ]
});

export default EstadoSolicitud;