import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@/config/database';

// ===========================================
// INTERFACES TYPESCRIPT
// ===========================================

interface PublicacionAttributes {
    id_publicacion: number;
    fecha_publicacion: Date;
    estado_publicacion: string;
    url_publicacion: string;
    id_solicitud: number;
    id_portal_postulacion: number;
    created_at?: Date;
    updated_at?: Date;
}

interface PublicacionCreationAttributes extends Optional<PublicacionAttributes, 'id_publicacion' | 'created_at' | 'updated_at'> { }

// ===========================================
// MODELO SEQUELIZE
// ===========================================

class Publicacion extends Model<PublicacionAttributes, PublicacionCreationAttributes> implements PublicacionAttributes {
    public id_publicacion!: number;
    public fecha_publicacion!: Date;
    public estado_publicacion!: string;
    public url_publicacion!: string;
    public id_solicitud!: number;
    public id_portal_postulacion!: number;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

// ===========================================
// DEFINICIÓN DEL MODELO
// ===========================================

Publicacion.init({
    id_publicacion: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    fecha_publicacion: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
            isDate: true,
            notNull: {
                msg: 'La fecha de publicación es requerida'
            }
        }
    },
    estado_publicacion: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'El estado de la publicación es requerido'
            },
            len: {
                args: [2, 100],
                msg: 'El estado debe tener entre 2 y 100 caracteres'
            }
        }
    },
    url_publicacion: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'La URL de la publicación es requerida'
            },
            len: {
                args: [10, 100],
                msg: 'La URL debe tener entre 10 y 100 caracteres'
            },
            isUrl: {
                msg: 'Debe ser una URL válida'
            }
        }
    },
    id_solicitud: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
    id_portal_postulacion: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'portal_postulacion',
            key: 'id_portal_postulacion'
        },
        validate: {
            notNull: {
                msg: 'El portal de postulación es requerido'
            }
        }
    }
}, {
    sequelize,
    tableName: 'publicacion',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    indexes: [
        {
            fields: ['id_solicitud']
        },
        {
            fields: ['id_portal_postulacion']
        },
        {
            fields: ['fecha_publicacion']
        },
        {
            fields: ['estado_publicacion']
        }
    ]
});

export default Publicacion;
