import { Router } from 'express';
import { InstitucionController } from '@/controllers/institucionController';

const router = Router();

/**
 * @route GET /api/instituciones
 * @desc Obtener todas las instituciones
 */
router.get('/', InstitucionController.getAll);

export default router;

