import { Router } from 'express';
import { PostulacionController } from '@/controllers/postulacionController';
// import { authenticate, authorize } from '@/middleware/auth'; // Descomentar cuando esté listo

const router = Router();

/**
 * Rutas para gestión de Postulaciones/Candidatos
 * Base: /api/postulaciones
 */

// Obtener postulaciones por solicitud
router.get('/solicitud/:idSolicitud', PostulacionController.getBySolicitud);

// Crear nueva postulación
router.post('/', PostulacionController.create);

// Actualizar estado de postulación
router.put('/:id/estado', PostulacionController.updateEstado);

// Actualizar valoración del consultor
router.put('/:id/valoracion', PostulacionController.updateValoracion);

// Eliminar postulación
router.delete('/:id', PostulacionController.delete);

export default router;
