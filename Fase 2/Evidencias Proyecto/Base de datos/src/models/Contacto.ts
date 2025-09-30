import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@/config/database';

// ===========================================
// INTERFACES TYPESCRIPT
// ===========================================

interface ContactoAttributes {
  id_contacto: number;
  nombre_contacto: string;
  email_contacto: string;
  telefono_contacto: string;
  cargo_contacto: string;
  id_cliente: number;
  id_ciudad: number;
}

interface ContactoCreationAttributes extends Optional<ContactoAttributes, 'id_contacto'> {}

// ===========================================
// MODELO SEQUELIZE
// ===========================================

class Contacto extends Model<ContactoAttributes, ContactoCreationAttributes> implements ContactoAttributes {
  public id_contacto!: number;
  public nombre_contacto!: string;
  public email_contacto!: string;
  public telefono_contacto!: string;
  public cargo_contacto!: string;
  public id_cliente!: number;
  public id_ciudad!: number;

  // ===========================================
  // MÉTODOS PERSONALIZADOS
  // ===========================================

  /**
   * Obtiene el nombre completo del contacto
   */
  public getNombreCompleto(): string {
    return this.nombre_contacto.trim();
  }

  /**
   * Verifica si el email es válido
   */
  public isEmailValid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email_contacto);
  }
}

// ===========================================
// DEFINICIÓN DEL MODELO
// ===========================================

Contacto.init({
  id_contacto: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  nombre_contacto: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El nombre del contacto es requerido'
      },
      len: {
        args: [2, 100],
        msg: 'El nombre debe tener entre 2 y 100 caracteres'
      }
    }
  },
  email_contacto: {
    type: DataTypes.STRING(256),
    allowNull: false,
    validate: {
      isEmail: {
        msg: 'Debe ser un email válido'
      },
      notEmpty: {
        msg: 'El email es requerido'
      }
    }
  },
  telefono_contacto: {
    type: DataTypes.STRING(12),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El teléfono es requerido'
      },
      len: {
        args: [8, 12],
        msg: 'El teléfono debe tener entre 8 y 12 caracteres'
      }
    }
  },
  cargo_contacto: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El cargo es requerido'
      },
      len: {
        args: [2, 100],
        msg: 'El cargo debe tener entre 2 y 100 caracteres'
      }
    }
  },
  id_cliente: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'cliente',
      key: 'id_cliente'
    },
    validate: {
      notNull: {
        msg: 'El cliente es requerido'
      }
    }
  },
  id_ciudad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'comuna',
      key: 'id_ciudad'
    },
    validate: {
      notNull: {
        msg: 'La ciudad es requerida'
      }
    }
  }
}, {
  sequelize,
  tableName: 'contacto',
  timestamps: false,
  underscored: true,
  indexes: [
    {
      fields: ['id_cliente']
    },
    {
      fields: ['id_ciudad']
    },
    {
      unique: true,
      fields: ['email_contacto']
    }
  ]
});

export default Contacto;
