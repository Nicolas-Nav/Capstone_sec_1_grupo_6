import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@/config/database';

// ===========================================
// INTERFACES TYPESCRIPT
// ===========================================

interface EstadoSolicitudHistAttributes {
    fecha_cambio_estado_solicitud: Date;
    id_estado_solicitud: number;
    id_solicitud: number;
    comentario_estado_solicitud_hist?: string | null; // <-- nombre representativo
}

interface EstadoSolicitudHistCreationAttributes
    extends Optional<EstadoSolicitudHistAttributes, 'fecha_cambio_estado_solicitud' | 'comentario_estado_solicitud_hist'> { }

// ===========================================
// MODELO SEQUELIZE
// ===========================================

class EstadoSolicitudHist extends Model<EstadoSolicitudHistAttributes, EstadoSolicitudHistCreationAttributes>
    implements EstadoSolicitudHistAttributes {

    public fecha_cambio_estado_solicitud!: Date;
    public id_estado_solicitud!: number;
    public id_solicitud!: number;
    public comentario_estado_solicitud_hist?: string | null; // <-- propiedad en la clase
}

// ===========================================
// DEFINICIÓN DEL MODELO
// ===========================================

EstadoSolicitudHist.init({
    fecha_cambio_estado_solicitud: {
        type: DataTypes.DATE,
        allowNull: false,
        primaryKey: true,
        validate: {
            isDate: true,
            notNull: {
                msg: 'La fecha del cambio de estado es requerida'
            }
        }
    },
    id_estado_solicitud: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
            model: 'estado',
            key: 'id_estado_solicitud'
        },
        validate: {
            notNull: {
                msg: 'El estado de la solicitud es requerido'
            }
        }
    },
    id_solicitud: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
            model: 'solicitud',
            key: 'id_solicitud'
        },
        validate: {
            notNull: {
                msg: 'La solicitud es requerida'
            }
        }
    },
    comentario_estado_solicitud_hist: {  // <-- atributo nuevo
        type: DataTypes.STRING(500),
        allowNull: true
    }
}, {
    sequelize,
    tableName: 'estado_solicitud_hist',
    timestamps: false,
    underscored: true,  // <-- esto asegura que se use guion bajo en la DB
    indexes: [
        { fields: ['id_estado_solicitud'] },
        { fields: ['id_solicitud'] },
        { fields: ['fecha_cambio_estado_solicitud'] }
    ]
});

export default EstadoSolicitudHist;
