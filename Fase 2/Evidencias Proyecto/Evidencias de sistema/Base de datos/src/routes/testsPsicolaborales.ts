import { Router } from 'express';
import { TestPsicolaboralController } from '@/controllers/testPsicolaboralController';

const router = Router();

/**
 * Rutas para gestión de Tests Psicolaborales
 * Base: /api/tests-psicolaborales
 * Los tests se cargan directamente en la BD mediante scripts SQL
 */

// Obtener todos los tests (para selección en Módulo 4)
router.get('/', TestPsicolaboralController.getAll);

// Obtener un test específico
router.get('/:id', TestPsicolaboralController.getById);

// Crear nuevo test
router.post('/', TestPsicolaboralController.create);

// Actualizar test
router.put('/:id', TestPsicolaboralController.update);

// Eliminar test
router.delete('/:id', TestPsicolaboralController.delete);

export default router;

