import { Router } from 'express';
import { EvaluacionPsicolaboralController } from '@/controllers/evaluacionPsicolaboralController';
import { authenticateToken } from '@/middleware/auth';

const router = Router();

/**
 * Rutas para gestión de Evaluaciones Psicolaborales
 * Base: /api/evaluaciones-psicolaborales
 */

// Rutas públicas de lectura (GET)
// Obtener evaluaciones por postulación
router.get('/postulacion/:idPostulacion', EvaluacionPsicolaboralController.getByPostulacion);

// Obtener evaluaciones pendientes
router.get('/pendientes', EvaluacionPsicolaboralController.getPendientes);

// Obtener todas las evaluaciones
router.get('/', EvaluacionPsicolaboralController.getAll);

// Obtener una evaluación específica
router.get('/:id', EvaluacionPsicolaboralController.getById);

// ====================================
// RUTAS PROTEGIDAS (requieren token)
// ====================================
router.use(authenticateToken);

// Agregar resultado de test
router.post('/:id/tests', EvaluacionPsicolaboralController.addTest);

// Eliminar resultado de test
router.delete('/:id/tests/:idTest', EvaluacionPsicolaboralController.deleteTest);

// Marcar evaluación como realizada
router.put('/:id/marcar-realizada', EvaluacionPsicolaboralController.marcarRealizada);

// Actualizar estado del informe
router.put('/:id/estado-informe', EvaluacionPsicolaboralController.actualizarEstadoInforme);

// Actualizar conclusión global del informe
router.put('/:id/conclusion-global', EvaluacionPsicolaboralController.actualizarConclusionGlobal);

// Actualizar informe completo (estado + conclusión)
router.put('/:id/informe-completo', EvaluacionPsicolaboralController.actualizarInformeCompleto);

// Crear nueva evaluación
router.post('/', EvaluacionPsicolaboralController.create);

// Actualizar evaluación
router.put('/:id', EvaluacionPsicolaboralController.update);

// Eliminar evaluación
router.delete('/:id', EvaluacionPsicolaboralController.delete);

export default router;

