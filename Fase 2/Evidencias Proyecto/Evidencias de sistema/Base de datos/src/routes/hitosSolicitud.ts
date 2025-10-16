import { Router } from 'express';
import { HitoSolicitudController } from '@/controllers/hitoSolicitudController';

const router = Router();

/**
 * Rutas para gestión de Hitos de Solicitud
 * Base: /api/hitos-solicitud
 */

// ===========================================
// PLANTILLAS
// ===========================================

// Obtener plantillas
router.get('/plantillas', HitoSolicitudController.getPlantillas);

// Crear plantilla (admin)
router.post('/plantillas', HitoSolicitudController.createPlantilla);

// ===========================================
// HITOS POR SOLICITUD
// ===========================================

// Copiar plantillas a una solicitud
router.post('/copiar-plantillas', HitoSolicitudController.copiarPlantillas);

// Activar hitos por evento ancla
router.post('/activar-evento', HitoSolicitudController.activarEvento);

// Obtener hitos de una solicitud
router.get('/solicitud/:idSolicitud', HitoSolicitudController.getBySolicitud);

// ===========================================
// CONSULTAS DASHBOARD
// ===========================================

// Obtener hitos vencidos
router.get('/vencidos', HitoSolicitudController.getVencidos);

// Obtener hitos por vencer
router.get('/por-vencer', HitoSolicitudController.getPorVencer);

// Obtener hitos pendientes
router.get('/pendientes', HitoSolicitudController.getPendientes);

// Obtener hitos completados
router.get('/completados', HitoSolicitudController.getCompletados);

// Obtener estadísticas
router.get('/estadisticas', HitoSolicitudController.getEstadisticas);

// ===========================================
// ACCIONES
// ===========================================

// Completar un hito
router.put('/:id/completar', HitoSolicitudController.completar);

// ===========================================
// CRUD BÁSICO
// ===========================================

// Obtener un hito específico
router.get('/:id', HitoSolicitudController.getById);

// Actualizar hito
router.put('/:id', HitoSolicitudController.update);

// Eliminar hito (solo plantillas)
router.delete('/:id', HitoSolicitudController.delete);

export default router;
