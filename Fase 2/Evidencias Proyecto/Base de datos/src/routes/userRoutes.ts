import express from 'express';
import { createUserController, getUsersController, updateUserController, changePasswordController } from '@/controllers/userController';
import { authenticateToken, requireAdmin } from '@/middleware/auth';

const router = express.Router();

// REGISTRO DE NUEVO USUARIO (solo admins)
router.post('/register', authenticateToken, requireAdmin, createUserController);

// Obtener usuarios paginados con filtros
router.get("/", getUsersController);

// Actualizar usuario
router.put('/users', updateUserController);

// Cambiar contraseña (cualquier usuario autenticado puede cambiar su propia contraseña)
router.put('/change-password', authenticateToken, changePasswordController);

export default router;