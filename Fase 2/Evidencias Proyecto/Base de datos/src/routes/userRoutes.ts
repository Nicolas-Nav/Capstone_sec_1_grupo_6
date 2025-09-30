import express from 'express';
import { createUserController } from '@/controllers/userController';
import { authenticateToken, requireAdmin } from '@/middleware/auth';

const router = express.Router();

// REGISTRO DE NUEVO USUARIO (solo admins)
router.post('/register', authenticateToken, requireAdmin, createUserController);

export default router;