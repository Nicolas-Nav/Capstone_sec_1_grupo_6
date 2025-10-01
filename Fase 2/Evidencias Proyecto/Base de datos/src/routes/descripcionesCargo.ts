import { Router } from 'express';
import { DescripcionCargoController } from '@/controllers/descripcionCargoController';

const router = Router();

/**
 * @route   GET /api/descripciones-cargo
 * @desc    Obtener todas las descripciones de cargo
 * @access  Private
 */
router.get('/', DescripcionCargoController.getAll);

/**
 * @route   GET /api/descripciones-cargo/:id
 * @desc    Obtener una descripción de cargo por ID
 * @access  Private
 */
router.get('/:id', DescripcionCargoController.getById);

/**
 * @route   POST /api/descripciones-cargo
 * @desc    Crear nueva descripción de cargo
 * @access  Private (Admin)
 */
router.post('/', DescripcionCargoController.create);

/**
 * @route   POST /api/descripciones-cargo/:id/excel
 * @desc    Agregar datos de Excel procesados (JSON) a una descripción de cargo
 * @access  Private
 * @note    El Excel se procesa en el frontend con xlsx.js y se envía el JSON resultante
 */
router.post('/:id/excel', DescripcionCargoController.agregarDatosExcel);

/**
 * @route   GET /api/descripciones-cargo/:id/excel
 * @desc    Obtener datos de Excel guardados de una descripción
 * @access  Private
 */
router.get('/:id/excel', DescripcionCargoController.getDatosExcel);

/**
 * @route   PUT /api/descripciones-cargo/:id
 * @desc    Actualizar descripción de cargo
 * @access  Private (Admin)
 */
router.put('/:id', DescripcionCargoController.update);

/**
 * @route   DELETE /api/descripciones-cargo/:id
 * @desc    Eliminar descripción de cargo
 * @access  Private (Admin)
 */
router.delete('/:id', DescripcionCargoController.delete);

export default router;

