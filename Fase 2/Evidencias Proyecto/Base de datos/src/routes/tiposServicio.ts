import { Router } from 'express';
import { TipoServicioController } from '@/controllers/tipoServicioController';

const router = Router();

/**
 * @route   GET /api/tipos-servicio
 * @desc    Obtener todos los tipos de servicio
 * @access  Private
 */
router.get('/', TipoServicioController.getAll);

/**
 * @route   GET /api/tipos-servicio/:codigo
 * @desc    Obtener un tipo de servicio por código
 * @access  Private
 */
router.get('/:codigo', TipoServicioController.getByCodigo);

/**
 * @route   POST /api/tipos-servicio
 * @desc    Crear nuevo tipo de servicio
 * @access  Private (Admin)
 */
router.post('/', TipoServicioController.create);

/**
 * @route   PUT /api/tipos-servicio/:codigo
 * @desc    Actualizar tipo de servicio
 * @access  Private (Admin)
 */
router.put('/:codigo', TipoServicioController.update);

/**
 * @route   DELETE /api/tipos-servicio/:codigo
 * @desc    Eliminar tipo de servicio
 * @access  Private (Admin)
 */
router.delete('/:codigo', TipoServicioController.delete);

export default router;

