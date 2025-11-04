import { Router } from 'express';
import { ClienteController } from '@/controllers/clienteController';
import { authenticateToken } from '@/middleware/auth';

const router = Router();

/**
 * Rutas para gestión de Clientes
 * Base: /api/clientes
 */

// Rutas públicas de lectura (GET)
// Obtener estadísticas de clientes
router.get('/stats', ClienteController.getStats);

// Obtener clientes paginados con filtros
router.get('/', ClienteController.getAll);

// Obtener todos los clientes (sin paginación)
router.get('/all', ClienteController.getAllClientes);

// Obtener un cliente específico
router.get('/:id', ClienteController.getById);

// ====================================
// RUTAS PROTEGIDAS (requieren token)
// ====================================
router.use(authenticateToken);

// Crear nuevo cliente
router.post('/', ClienteController.create);

// Actualizar cliente
router.put('/:id', ClienteController.update);

// Eliminar cliente
router.delete('/:id', ClienteController.delete);

export default router;
