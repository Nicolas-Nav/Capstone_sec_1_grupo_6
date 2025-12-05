import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@/config/database';

// ===========================================
// INTERFACES TYPESCRIPT
// ===========================================

interface EstadoClienteM5Attributes {
    id_estado_cliente_postulacion_m5: number;
    nombre_estado: string;
}

interface EstadoClienteM5CreationAttributes extends Optional<EstadoClienteM5Attributes, 'id_estado_cliente_postulacion_m5'> { }

// ===========================================
// MODELO SEQUELIZE
// ===========================================

class EstadoClienteM5 extends Model<EstadoClienteM5Attributes, EstadoClienteM5CreationAttributes> implements EstadoClienteM5Attributes {
    public id_estado_cliente_postulacion_m5!: number;
    public nombre_estado!: string;

    // Métodos de utilidad
    public requiereComentarios(): boolean {
        const nombreEstado = this.nombre_estado.toLowerCase();
        return nombreEstado === 'no seleccionado' || nombreEstado === 'rechazo carta oferta';
    }

    public getEstadosDisponibles(): string[] {
        const estadoActual = this.nombre_estado.toLowerCase();
        
        switch (estadoActual) {
            case 'en espera de feedback':
                return ['No seleccionado', 'Envío de carta oferta'];
            case 'envío de carta oferta':
                return ['Aceptación carta oferta', 'Rechazo carta oferta'];
            default:
                return [];
        }
    }
}

// ===========================================
// DEFINICIÓN DEL MODELO
// ===========================================

EstadoClienteM5.init({
    id_estado_cliente_postulacion_m5: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    nombre_estado: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
            notNull: {
                msg: 'El nombre del estado es requerido'
            },
            notEmpty: {
                msg: 'El nombre del estado no puede estar vacío'
            },
            len: {
                args: [1, 50],
                msg: 'El nombre del estado debe tener entre 1 y 50 caracteres'
            }
        }
    }
}, {
    sequelize,
    tableName: 'estado_cliente_m5',
    timestamps: false,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['nombre_estado']
        }
    ]
});

export default EstadoClienteM5;
