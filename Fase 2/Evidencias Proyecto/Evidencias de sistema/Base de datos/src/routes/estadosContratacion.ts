import { Router } from 'express';
import { EstadoContratacionController } from '@/controllers/estadoContratacionController';

const router = Router();

/**
 * Rutas para gestión de Estados de Contratación
 * Base: /api/estados-contratacion
 * Los estados se cargan directamente en la BD mediante scripts SQL
 */

// Obtener todos los estados (para selección)
router.get('/', EstadoContratacionController.getAll);

// Obtener un estado específico
router.get('/:id', EstadoContratacionController.getById);

// Crear nuevo estado
router.post('/', EstadoContratacionController.create);

// Actualizar estado
router.put('/:id', EstadoContratacionController.update);

// Eliminar estado
router.delete('/:id', EstadoContratacionController.delete);

export default router;

