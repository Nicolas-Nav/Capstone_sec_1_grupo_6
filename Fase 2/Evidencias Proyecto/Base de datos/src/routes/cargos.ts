import { Router } from 'express';
import { CargoController } from '@/controllers/cargoController';

const router = Router();

/**
 * @route   GET /api/cargos
 * @desc    Obtener todos los cargos
 * @access  Private
 */
router.get('/', CargoController.getAll);

/**
 * @route   GET /api/cargos/:id
 * @desc    Obtener un cargo por ID
 * @access  Private
 */
router.get('/:id', CargoController.getById);

/**
 * @route   POST /api/cargos
 * @desc    Crear nuevo cargo
 * @access  Private (Admin)
 */
router.post('/', CargoController.create);

/**
 * @route   POST /api/cargos/find-or-create
 * @desc    Buscar o crear cargo por nombre
 * @access  Private
 */
router.post('/find-or-create', CargoController.findOrCreate);

/**
 * @route   PUT /api/cargos/:id
 * @desc    Actualizar cargo
 * @access  Private (Admin)
 */
router.put('/:id', CargoController.update);

/**
 * @route   DELETE /api/cargos/:id
 * @desc    Eliminar cargo
 * @access  Private (Admin)
 */
router.delete('/:id', CargoController.delete);

export default router;

