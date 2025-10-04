import { Router } from 'express';
import { SolicitudController } from '@/controllers/solicitudController';
// import { authenticate, authorize } from '@/middleware/auth'; // Descomentar cuando esté listo

const router = Router();

/**
 * Rutas para gestión de Solicitudes (Process en frontend)
 * Base: /api/solicitudes
 */

// Obtener solicitudes por consultor
router.get('/consultor/:rutUsuario', SolicitudController.getByConsultor);

// Obtener solicitudes paginadas con filtros
router.get('/', SolicitudController.getAll);

// Obtener todas las solicitudes (sin paginación)
router.get('/all', SolicitudController.getAllSolicitudes);

// Obtener una solicitud específica
router.get('/:id', SolicitudController.getById);

// Crear nueva solicitud
router.post('/', SolicitudController.create);

// Actualizar estado de solicitud
router.put('/:id/estado', SolicitudController.updateEstado);

// Cambiar etapa de solicitud
router.put('/:id/etapa', SolicitudController.cambiarEtapa);

// Avanzar al módulo 2
router.put('/:id/avanzar-modulo2', SolicitudController.avanzarAModulo2);

// Obtener etapas disponibles
router.get('/etapas/disponibles', SolicitudController.getEtapas);

// Obtener estados de solicitud disponibles
router.get('/estados/disponibles', SolicitudController.getEstadosSolicitud);

// Eliminar solicitud
router.delete('/:id', SolicitudController.delete);

router.put('/:id', SolicitudController.update);

export default router;
