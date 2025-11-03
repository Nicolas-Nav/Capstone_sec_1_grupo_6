import { Router } from 'express';
import { ReferenciaLaboralController } from '@/controllers/referenciaLaboralController';
import { authenticateToken } from '@/middleware/auth';

const router = Router();

/**
 * Rutas para gestión de Referencias Laborales
 * Base: /api/referencias-laborales
 */

// Rutas públicas de lectura (GET)
// Obtener referencias por candidato
router.get('/candidato/:idCandidato', ReferenciaLaboralController.getByCandidato);

// Obtener todas las referencias
router.get('/', ReferenciaLaboralController.getAll);

// Obtener una referencia específica
router.get('/:id', ReferenciaLaboralController.getById);

// ====================================
// RUTAS PROTEGIDAS (requieren token)
// ====================================
router.use(authenticateToken);

// Crear múltiples referencias
router.post('/multiples', ReferenciaLaboralController.createMultiples);

// Crear nueva referencia
router.post('/', ReferenciaLaboralController.create);

// Actualizar referencia
router.put('/:id', ReferenciaLaboralController.update);

// Eliminar referencia
router.delete('/:id', ReferenciaLaboralController.delete);

export default router;

