import { Router } from 'express';
import { RegionController } from '../controllers/regionController';

const router = Router();

/**
 * Rutas para gestión de Regiones
 * Base: /api/regiones
 */

// Obtener todas las regiones
router.get('/', RegionController.getAll);

export default router;
