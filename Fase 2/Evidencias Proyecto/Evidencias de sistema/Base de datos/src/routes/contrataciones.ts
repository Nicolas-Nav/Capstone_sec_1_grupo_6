import { Router } from 'express';
import { ContratacionController } from '@/controllers/contratacionController';

const router = Router();

/**
 * Rutas para gestión de Contrataciones
 * Base: /api/contrataciones
 */

// Obtener estadísticas
router.get('/estadisticas', ContratacionController.getEstadisticas);

// Obtener contrataciones por estado
router.get('/estado/:idEstado', ContratacionController.getByEstado);

// Obtener contratación por postulación
router.get('/postulacion/:idPostulacion', ContratacionController.getByPostulacion);

// Actualizar estado de contratación
router.put('/:id/estado', ContratacionController.updateEstado);

// Registrar encuesta
router.put('/:id/encuesta', ContratacionController.registrarEncuesta);

// Obtener todas las contrataciones
router.get('/', ContratacionController.getAll);

// Obtener una contratación específica
router.get('/:id', ContratacionController.getById);

// Crear nueva contratación
router.post('/', ContratacionController.create);

// Actualizar contratación
router.put('/:id', ContratacionController.update);

// Eliminar contratación
router.delete('/:id', ContratacionController.delete);

export default router;

