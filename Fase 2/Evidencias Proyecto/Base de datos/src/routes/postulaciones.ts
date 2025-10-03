import { Router } from 'express';
import { PostulacionController } from '@/controllers/postulacionController';
import { uploadCV } from '@/config/multer';
// import { authenticate, authorize } from '@/middleware/auth'; // Descomentar cuando esté listo

const router = Router();

/**
 * Rutas para gestión de Postulaciones/Candidatos
 * Base: /api/postulaciones
 */

// Obtener postulaciones por solicitud
router.get('/solicitud/:idSolicitud', PostulacionController.getBySolicitud);

// Crear nueva postulación (con CV opcional)
router.post('/', uploadCV.single('cv'), PostulacionController.create);

// Actualizar estado de postulación
router.put('/:id/estado', PostulacionController.updateEstado);

// Actualizar valoración del consultor
router.put('/:id/valoracion', PostulacionController.updateValoracion);

// ==================================================
// GESTIÓN DE CV
// ==================================================

// Descargar CV de postulación
router.get('/:id/cv', PostulacionController.downloadCV);

// Subir o actualizar CV de postulación
router.post('/:id/cv', uploadCV.single('cv'), PostulacionController.uploadCV);

// Eliminar postulación
router.delete('/:id', PostulacionController.delete);

export default router;
