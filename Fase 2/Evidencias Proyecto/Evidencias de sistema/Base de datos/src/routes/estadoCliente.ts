import { Router } from 'express';
import { EstadoClienteController } from '@/controllers/estadoClienteController';

const router = Router();

// Obtener todos los estados de cliente
router.get('/', EstadoClienteController.getAll);

// Cambiar estado de cliente para una postulación
router.put('/postulacion/:id_postulacion', EstadoClienteController.cambiarEstado);

// Obtener historial de cambios de estado para una postulación
router.get('/postulacion/:id_postulacion/historial', EstadoClienteController.getHistorial);

export default router;
