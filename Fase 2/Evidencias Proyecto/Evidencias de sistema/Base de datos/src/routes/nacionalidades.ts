import { Router } from 'express';
import { NacionalidadController } from '@/controllers/nacionalidadController';

const router = Router();

/**
 * @route GET /api/nacionalidades
 * @desc Obtener todas las nacionalidades
 */
router.get('/', NacionalidadController.getAll);

export default router;

