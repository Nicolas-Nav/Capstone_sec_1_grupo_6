# LL Consulting Backend

Backend para el sistema de gestión de candidatos y procesos de reclutamiento de LL Consulting.

## 🚀 Tecnologías

- **Node.js** - Runtime de JavaScript
- **TypeScript** - Superset tipado de JavaScript
- **Express.js** - Framework web para Node.js
- **PostgreSQL** - Base de datos relacional
- **Sequelize** - ORM para Node.js
- **JWT** - Autenticación basada en tokens
- **Bcrypt** - Encriptación de contraseñas

## 📁 Estructura del Proyecto

```
backend/
├── src/
│   ├── config/          # Configuraciones
│   ├── controllers/     # Controladores de rutas
│   ├── middleware/      # Middlewares personalizados
│   ├── models/          # Modelos de Sequelize
│   ├── routes/          # Definición de rutas
│   ├── types/           # Tipos TypeScript
│   ├── utils/           # Utilidades
│   ├── app.ts           # Configuración de Express
│   └── server.ts        # Punto de entrada
├── database/
│   ├── migrations/      # Migraciones de BD
│   └── seeds/          # Datos de prueba
├── logs/               # Archivos de log
├── uploads/            # Archivos subidos
└── dist/               # Código compilado
```

## 🛠️ Instalación

### Prerrequisitos

- Node.js (v18 o superior)
- PostgreSQL (v12 o superior)
- npm o yarn

### Pasos de instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp env.example .env
   ```
   
   Editar el archivo `.env` con tus configuraciones:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=llconsulting_db
   DB_USER=postgres
   DB_PASSWORD=tu_password
   JWT_SECRET=tu_jwt_secret_muy_seguro
   ```

4. **Crear la base de datos**
   ```sql
   CREATE DATABASE llconsulting_db;
   ```

5. **Ejecutar migraciones**
   ```bash
   npm run migrate
   ```

6. **Poblar con datos de prueba (opcional)**
   ```bash
   npm run seed
   ```

## 🚀 Uso

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm run build
npm start
```

## 📊 Scripts Disponibles

- `npm run dev` - Inicia el servidor en modo desarrollo
- `npm run build` - Compila TypeScript a JavaScript
- `npm start` - Inicia el servidor en producción
- `npm run migrate` - Ejecuta migraciones
- `npm run migrate:undo` - Revierte la última migración
- `npm run seed` - Pobla la BD con datos de prueba
- `npm run seed:undo` - Elimina datos de prueba

## 🔧 Configuración

### Variables de Entorno

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `DB_HOST` | Host de PostgreSQL | localhost |
| `DB_PORT` | Puerto de PostgreSQL | 5432 |
| `DB_NAME` | Nombre de la base de datos | llconsulting_db |
| `DB_USER` | Usuario de PostgreSQL | postgres |
| `DB_PASSWORD` | Contraseña de PostgreSQL | - |
| `PORT` | Puerto del servidor | 3001 |
| `JWT_SECRET` | Secreto para JWT | - |
| `NODE_ENV` | Entorno de ejecución | development |

## 📚 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/refresh` - Renovar token

### Usuarios
- `GET /api/users` - Listar usuarios
- `GET /api/users/:id` - Obtener usuario
- `POST /api/users` - Crear usuario
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

### Clientes
- `GET /api/clients` - Listar clientes
- `GET /api/clients/:id` - Obtener cliente
- `POST /api/clients` - Crear cliente
- `PUT /api/clients/:id` - Actualizar cliente
- `DELETE /api/clients/:id` - Eliminar cliente

### Procesos
- `GET /api/processes` - Listar procesos
- `GET /api/processes/:id` - Obtener proceso
- `POST /api/processes` - Crear proceso
- `PUT /api/processes/:id` - Actualizar proceso
- `DELETE /api/processes/:id` - Eliminar proceso

### Candidatos
- `GET /api/candidates` - Listar candidatos
- `GET /api/candidates/:id` - Obtener candidato
- `POST /api/candidates` - Crear candidato
- `PUT /api/candidates/:id` - Actualizar candidato
- `DELETE /api/candidates/:id` - Eliminar candidato

## 🔒 Autenticación

El sistema utiliza JWT (JSON Web Tokens) para la autenticación. Incluye el token en el header:

```
Authorization: Bearer <token>
```

## 📝 Logs

Los logs se guardan en la carpeta `logs/` con los siguientes niveles:
- `info.log` - Información general
- `warn.log` - Advertencias
- `error.log` - Errores
- `debug.log` - Información de debug (solo en desarrollo)

## 🧪 Testing

```bash
npm test
```

## 📄 Licencia

MIT License

## 👥 Contribuidores

- LL Consulting Team

## 📞 Soporte

Para soporte técnico, contactar al equipo de desarrollo.
