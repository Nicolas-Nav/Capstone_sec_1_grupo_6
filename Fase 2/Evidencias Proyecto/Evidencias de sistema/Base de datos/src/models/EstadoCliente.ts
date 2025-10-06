import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@/config/database';

// ===========================================
// INTERFACES TYPESCRIPT
// ===========================================

interface EstadoClienteAttributes {
    id_estado_cliente: number;
    nombre_estado: string;
}

interface EstadoClienteCreationAttributes extends Optional<EstadoClienteAttributes, 'id_estado_cliente'> { }

// ===========================================
// MODELO SEQUELIZE
// ===========================================

class EstadoCliente extends Model<EstadoClienteAttributes, EstadoClienteCreationAttributes> implements EstadoClienteAttributes {
    public id_estado_cliente!: number;
    public nombre_estado!: string;

    // ===========================================
    // MÉTODOS PERSONALIZADOS
    // ===========================================

    /**
     * Verifica si el cliente está pendiente de respuesta
     * (Estado: pendiente)
     */
    public estaPendiente(): boolean {
        return this.nombre_estado.toLowerCase() === 'pendiente';
    }

    /**
     * Verifica si el cliente rechazó al candidato
     * (Estado: rechazado)
     */
    public rechazo(): boolean {
        return this.nombre_estado.toLowerCase() === 'rechazado';
    }

    /**
     * Verifica si el cliente aprobó al candidato
     * (Estado: aprobado)
     */
    public aprobo(): boolean {
        return this.nombre_estado.toLowerCase() === 'aprobado';
    }

    /**
     * Verifica si el cliente observó al candidato
     * (Estado: observado)
     */
    public observo(): boolean {
        return this.nombre_estado.toLowerCase() === 'observado';
    }

    /**
     * Verifica si el cliente ya respondió (no está pendiente)
     * (Estados: rechazado, aprobado, observado)
     */
    public yaRespondio(): boolean {
        const nombreEstado = this.nombre_estado.toLowerCase();
        return nombreEstado === 'rechazado' ||
            nombreEstado === 'aprobado' ||
            nombreEstado === 'observado';
    }

    /**
     * Verifica si la respuesta es positiva
     * (Estados: aprobado, observado)
     */
    public respuestaPositiva(): boolean {
        const nombreEstado = this.nombre_estado.toLowerCase();
        return nombreEstado === 'aprobado' || nombreEstado === 'observado';
    }

    /**
     * Verifica si la respuesta es negativa
     * (Estado: rechazado)
     */
    public respuestaNegativa(): boolean {
        return this.nombre_estado.toLowerCase() === 'rechazado';
    }

    /**
     * Obtiene el nombre del estado formateado
     */
    public getNombreFormateado(): string {
        return this.nombre_estado.trim();
    }


    /**
     * Obtiene información completa del estado para la interfaz
     */
    public getInfoInterfaz(): {
        nombre: string;
        pendiente: boolean;
        rechazado: boolean;
        aprobado: boolean;
        observado: boolean;
        yaRespondio: boolean;
        respuestaPositiva: boolean;
        respuestaNegativa: boolean;
    } {
        return {
            nombre: this.getNombreFormateado(),
            pendiente: this.estaPendiente(),
            rechazado: this.rechazo(),
            aprobado: this.aprobo(),
            observado: this.observo(),
            yaRespondio: this.yaRespondio(),
            respuestaPositiva: this.respuestaPositiva(),
            respuestaNegativa: this.respuestaNegativa()
        };
    }

    /**
     * Obtiene los estados disponibles para transición
     * (Basado en la lógica del módulo 3)
     */
    public getEstadosDisponibles(): string[] {
        const nombreEstado = this.nombre_estado.toLowerCase();

        switch (nombreEstado) {
            case 'pendiente':
                return ['rechazado', 'aprobado', 'observado'];
            case 'rechazado':
                return []; // Estado final - no se puede cambiar
            case 'aprobado':
                return []; // Estado final - no se puede cambiar
            case 'observado':
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
     * Verifica si requiere comentarios obligatorios
     * (Estados: rechazado, observado)
     */
    public requiereComentarios(): boolean {
        const nombreEstado = this.nombre_estado.toLowerCase();
        return nombreEstado === 'rechazado' || nombreEstado === 'observado';
    }
}

// ===========================================
// DEFINICIÓN DEL MODELO
// ===========================================

EstadoCliente.init({
    id_estado_cliente: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    nombre_estado: {
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
    tableName: 'estado_cliente',
    timestamps: false,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['nombre_estado']
        }
    ]
});

export default EstadoCliente;
