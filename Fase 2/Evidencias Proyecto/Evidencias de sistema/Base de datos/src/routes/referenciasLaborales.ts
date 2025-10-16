import { Router } from 'express';
import { ReferenciaLaboralController } from '@/controllers/referenciaLaboralController';

const router = Router();

/**
 * Rutas para gestión de Referencias Laborales
 * Base: /api/referencias-laborales
 */

// Obtener referencias por candidato
router.get('/candidato/:idCandidato', ReferenciaLaboralController.getByCandidato);

// Crear múltiples referencias
router.post('/multiples', ReferenciaLaboralController.createMultiples);

// Obtener todas las referencias
router.get('/', ReferenciaLaboralController.getAll);

// Obtener una referencia específica
router.get('/:id', ReferenciaLaboralController.getById);

// Crear nueva referencia
router.post('/', ReferenciaLaboralController.create);

// Actualizar referencia
router.put('/:id', ReferenciaLaboralController.update);

// Eliminar referencia
router.delete('/:id', ReferenciaLaboralController.delete);

export default router;

