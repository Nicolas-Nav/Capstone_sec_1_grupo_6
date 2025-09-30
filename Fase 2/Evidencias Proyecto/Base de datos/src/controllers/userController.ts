import { Request, Response } from 'express';
import { createUser } from '@/services/userService';
import { sendError, sendSuccess } from '@/utils/response';

export const createUserController = async (req: Request, res: Response) => {
  try {
    const userData = req.body;
    const newUser = await createUser(userData);

    return sendSuccess(res, newUser, 'Usuario creado correctamente');
  } catch (error: any) {
    return sendError(res, error.message || 'Error al crear usuario');
  }
};
