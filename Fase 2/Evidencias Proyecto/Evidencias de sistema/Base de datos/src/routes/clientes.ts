import { Router } from 'express';
import { ClienteController } from '@/controllers/clienteController';
// import { authenticate } from '@/middleware/auth'; // Descomentar cuando esté listo

const router = Router();

/**
 * Rutas para gestión de Clientes
 * Base: /api/clientes
 */

// Obtener estadísticas de clientes
router.get('/stats', ClienteController.getStats);

// Obtener clientes paginados con filtros
router.get('/', ClienteController.getAll);

// Obtener todos los clientes (sin paginación)
router.get('/all', ClienteController.getAllClientes);

// Obtener un cliente específico
router.get('/:id', ClienteController.getById);

// Crear nuevo cliente
router.post('/', ClienteController.create);

// Actualizar cliente
router.put('/:id', ClienteController.update);

// Eliminar cliente
router.delete('/:id', ClienteController.delete);

export default router;
