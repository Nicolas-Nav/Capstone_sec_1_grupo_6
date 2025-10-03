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

// Obtener todas las solicitudes
router.get('/', SolicitudController.getAll);

// Obtener una solicitud específica
router.get('/:id', SolicitudController.getById);

// Crear nueva solicitud
router.post('/', SolicitudController.create);

// Actualizar estado de solicitud
router.put('/:id/estado', SolicitudController.updateEstado);

// Cambiar etapa de solicitud
router.put('/:id/etapa', SolicitudController.cambiarEtapa);

// Eliminar solicitud
router.delete('/:id', SolicitudController.delete);

export default router;
