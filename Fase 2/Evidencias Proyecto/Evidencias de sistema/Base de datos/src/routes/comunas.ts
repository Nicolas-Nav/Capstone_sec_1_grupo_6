import { Router } from 'express';
import { ComunaController } from '../controllers/regionController';

const router = Router();

/**
 * Rutas para gestión de Comunas
 * Base: /api/comunas
 */

// Obtener todas las comunas
router.get('/', ComunaController.getAll);

// Obtener comunas por región
router.get('/region/:regionId', ComunaController.getByRegion);

export default router;
