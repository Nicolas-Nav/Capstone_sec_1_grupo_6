import { Router } from 'express';
import { HitoSolicitudController } from '@/controllers/hitoSolicitudController';
import { authenticateToken } from '@/middleware/auth';

const router = Router();

/**
 * Rutas para gestión de Hitos de Solicitud
 * Base: /api/hitos-solicitud
 */

// ===========================================
// RUTAS PÚBLICAS DE LECTURA (GET)
// ===========================================

// Obtener plantillas
router.get('/plantillas', HitoSolicitudController.getPlantillas);

// Obtener hitos de una solicitud
router.get('/solicitud/:idSolicitud', HitoSolicitudController.getBySolicitud);

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

// Obtener hitos con alertas en tiempo real
router.get('/alertas', HitoSolicitudController.getAlertas);

// Dashboard de hitos para consultores
router.get('/dashboard/:consultor_id', HitoSolicitudController.getDashboard);

// Obtener un hito específico
router.get('/:id', HitoSolicitudController.getById);

// ====================================
// RUTAS PROTEGIDAS (requieren token)
// ====================================
router.use(authenticateToken);

// ===========================================
// PLANTILLAS (protegidas)
// ===========================================

// Crear plantilla (admin)
router.post('/plantillas', HitoSolicitudController.createPlantilla);

// ===========================================
// HITOS POR SOLICITUD (protegidas)
// ===========================================

// Copiar plantillas a una solicitud
router.post('/copiar-plantillas', HitoSolicitudController.copiarPlantillas);

// Activar hitos por evento ancla
router.post('/activar-evento', HitoSolicitudController.activarEvento);

// ===========================================
// ACCIONES (protegidas)
// ===========================================

// Completar un hito
router.put('/:id/completar', HitoSolicitudController.completar);

// Actualizar hito
router.put('/:id', HitoSolicitudController.update);

// Eliminar hito (solo plantillas)
router.delete('/:id', HitoSolicitudController.delete);

export default router;
