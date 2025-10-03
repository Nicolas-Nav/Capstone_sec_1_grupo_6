import { Router } from 'express';
import { ProfesionController } from '@/controllers/profesionController';

const router = Router();

/**
 * @route GET /api/profesiones
 * @desc Obtener todas las profesiones
 */
router.get('/', ProfesionController.getAll);

export default router;

