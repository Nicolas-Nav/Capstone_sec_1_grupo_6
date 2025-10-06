import { Request, Response } from 'express';
import { loginUser } from '@/services/authService';
import { sendSuccess, sendError } from '@/utils/response';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser({ email, password });
    sendSuccess(res, result, 'Login exitoso');
  } catch (error: any) {
    sendError(res, error.message || 'Error al iniciar sesión', 401);
  }
};
