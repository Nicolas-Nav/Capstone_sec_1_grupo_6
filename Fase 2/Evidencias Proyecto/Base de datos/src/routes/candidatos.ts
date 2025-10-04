import { Router } from 'express';
import { CandidatoController } from '@/controllers/candidatoController';
// import { authenticate, authorize } from '@/middleware/auth'; // Descomentar cuando esté listo

const router = Router();

/**
 * Rutas para gestión de Candidatos
 * Base: /api/candidatos
 */

// Buscar candidato por email
router.get('/email/:email', CandidatoController.getByEmail);

// Obtener todos los candidatos
router.get('/', CandidatoController.getAll);

// Obtener un candidato específico
router.get('/:id', CandidatoController.getById);

// Crear nuevo candidato
router.post('/', CandidatoController.create);

// Actualizar candidato
router.put('/:id', CandidatoController.update);

// Eliminar candidato
router.delete('/:id', CandidatoController.delete);

// ==================================================
// EXPERIENCIAS LABORALES
// ==================================================

// Obtener experiencias de un candidato
router.get('/:id/experiencias', CandidatoController.getExperiencias);

// Agregar experiencias a un candidato
router.post('/:id/experiencias', CandidatoController.addExperiencias);

// Actualizar una experiencia
router.put('/:id/experiencias/:idExp', CandidatoController.updateExperiencia);

// Eliminar una experiencia
router.delete('/:id/experiencias/:idExp', CandidatoController.deleteExperiencia);

// ==================================================
// EDUCACIÓN Y PROFESIÓN
// ==================================================

// Agregar educación a un candidato
router.post('/:id/educacion', CandidatoController.addEducacion);

// Agregar profesión a un candidato
router.post('/:id/profesion', CandidatoController.addProfesion);

// Obtener CV de un candidato
router.get('/:id/cv', CandidatoController.getCV);

export default router;

