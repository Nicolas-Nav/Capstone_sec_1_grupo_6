import { Router } from 'express';
import { PublicacionController } from '@/controllers/publicacionController';
import { authenticateToken } from '@/middleware/auth';

const router = Router();

// Rutas públicas de lectura (GET)
// Obtener portales de postulación (debe ir antes de /:id)
router.get('/portales', PublicacionController.getPortales);

// Obtener todas las publicaciones
router.get('/', PublicacionController.getAll);

// Obtener una publicación por ID
router.get('/:id', PublicacionController.getById);

// ====================================
// RUTAS PROTEGIDAS (requieren token)
// ====================================
router.use(authenticateToken);

// Crear una nueva publicación
router.post('/', PublicacionController.create);

// Actualizar una publicación
router.put('/:id', PublicacionController.update);

// Eliminar una publicación
router.delete('/:id', PublicacionController.delete);

export default router;

