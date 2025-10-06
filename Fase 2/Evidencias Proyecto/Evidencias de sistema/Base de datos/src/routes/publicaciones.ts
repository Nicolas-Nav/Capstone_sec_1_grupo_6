import { Router } from 'express';
import { PublicacionController } from '@/controllers/publicacionController';

const router = Router();

// Obtener portales de postulación (debe ir antes de /:id)
router.get('/portales', PublicacionController.getPortales);

// Obtener todas las publicaciones
router.get('/', PublicacionController.getAll);

// Obtener una publicación por ID
router.get('/:id', PublicacionController.getById);

// Crear una nueva publicación
router.post('/', PublicacionController.create);

// Actualizar una publicación
router.put('/:id', PublicacionController.update);

// Eliminar una publicación
router.delete('/:id', PublicacionController.delete);

export default router;

