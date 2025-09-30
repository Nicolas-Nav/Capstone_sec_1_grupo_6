import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@/config/database';

// ===========================================
// INTERFACES TYPESCRIPT
// ===========================================

interface EstadoCandidatoAttributes {
    id_estado_candidato: number;
    nombre_estado_candidato: string;
    created_at?: Date;
    updated_at?: Date;
}

interface EstadoCandidatoCreationAttributes extends Optional<EstadoCandidatoAttributes, 'id_estado_candidato' | 'created_at' | 'updated_at'> { }

// ===========================================
// MODELO SEQUELIZE
// ===========================================

class EstadoCandidato extends Model<EstadoCandidatoAttributes, EstadoCandidatoCreationAttributes> implements EstadoCandidatoAttributes {
    public id_estado_candidato!: number;
    public nombre_estado_candidato!: string;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;

    // ===========================================
    // MÉTODOS PERSONALIZADOS
    // ===========================================

    /**
     * Verifica si el candidato está presentado al cliente
     * (Estado: presentado)
     */
    public estaPresentado(): boolean {
        return this.nombre_estado_candidato.toLowerCase() === 'presentado';
    }

    /**
     * Verifica si el candidato NO está presentado al cliente
     * (Estado: no_presentado)
     */
    public noEstaPresentado(): boolean {
        return this.nombre_estado_candidato.toLowerCase() === 'no_presentado';
    }

    /**
     * Verifica si el candidato fue rechazado
     * (Estado: rechazado - automático desde módulo 3)
     */
    public fueRechazado(): boolean {
        return this.nombre_estado_candidato.toLowerCase() === 'rechazado';
    }

    /**
     * Verifica si el candidato puede ser presentado al cliente
     * (Solo candidatos "no_presentado" pueden ser presentados)
     */
    public puedeSerPresentado(): boolean {
        return this.nombre_estado_candidato.toLowerCase() === 'no_presentado';
    }

    /**
     * Verifica si el candidato puede ser removido de la presentación
     * (Solo candidatos "presentado" pueden ser removidos)
     */
    public puedeSerRemovido(): boolean {
        return this.nombre_estado_candidato.toLowerCase() === 'presentado';
    }

    /**
     * Verifica si el candidato está en proceso (no rechazado)
     * (Estados: presentado, no_presentado)
     */
    public estaEnProceso(): boolean {
        const nombreEstado = this.nombre_estado_candidato.toLowerCase();
        return nombreEstado === 'presentado' || nombreEstado === 'no_presentado';
    }

    /**
     * Verifica si el candidato ya fue evaluado (estado final)
     * (Estado: rechazado)
     */
    public yaFueEvaluado(): boolean {
        return this.nombre_estado_candidato.toLowerCase() === 'rechazado';
    }

    /**
     * Obtiene el nombre del estado formateado
     */
    public getNombreFormateado(): string {
        return this.nombre_estado_candidato.trim();
    }


    /**
     * Obtiene información completa del estado para la interfaz
     */
    public getInfoInterfaz(): {
        nombre: string;
        presentado: boolean;
        noPresentado: boolean;
        rechazado: boolean;
        enProceso: boolean;
        evaluado: boolean;
        puedeSerPresentado: boolean;
        puedeSerRemovido: boolean;
    } {
        return {
            nombre: this.getNombreFormateado(),
            presentado: this.estaPresentado(),
            noPresentado: this.noEstaPresentado(),
            rechazado: this.fueRechazado(),
            enProceso: this.estaEnProceso(),
            evaluado: this.yaFueEvaluado(),
            puedeSerPresentado: this.puedeSerPresentado(),
            puedeSerRemovido: this.puedeSerRemovido()
        };
    }

    /**
     * Obtiene los estados disponibles para transición
     * (Basado en la lógica del módulo 2)
     */
    public getEstadosDisponibles(): string[] {
        const nombreEstado = this.nombre_estado_candidato.toLowerCase();

        switch (nombreEstado) {
            case 'no_presentado':
                return ['presentado'];
            case 'presentado':
                return ['no_presentado'];
            case 'rechazado':
                return []; // Estado final - no se puede cambiar
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

    /**
     * Obtiene el estado opuesto (para toggle)
     */
    public getEstadoOpuesto(): string {
        const nombreEstado = this.nombre_estado_candidato.toLowerCase();

        switch (nombreEstado) {
            case 'presentado':
                return 'no_presentado';
            case 'no_presentado':
                return 'presentado';
            default:
                return nombreEstado; // No hay opuesto para rechazado
        }
    }
}

// ===========================================
// DEFINICIÓN DEL MODELO
// ===========================================

EstadoCandidato.init({
    id_estado_candidato: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    nombre_estado_candidato: {
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
    tableName: 'estado_candidato',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['nombre_estado_candidato']
        }
    ]
});

export default EstadoCandidato;