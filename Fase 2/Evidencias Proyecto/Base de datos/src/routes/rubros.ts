import { Router } from 'express';
import { RubroController } from '@/controllers/rubroController';

const router = Router();

/**
 * @route GET /api/rubros
 * @desc Obtener todos los rubros
 */
router.get('/', RubroController.getAll);

export default router;

