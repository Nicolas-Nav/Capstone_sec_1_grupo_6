import { Request, Response } from 'express';
import { createUser, getUsers, updateUser } from '@/services/userService';
import { sendError, sendSuccess } from '@/utils/response';

// Crear usuario
export const createUserController = async (req: Request, res: Response) => {
  try {
    const userData = req.body;
    const newUser = await createUser(userData);
    return sendSuccess(res, newUser, 'Usuario creado correctamente');
  } catch (error: any) {
    return sendError(res, error.message || 'Error al crear usuario');
  }
};

// Obtener usuarios paginados
export const getUsersController = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";
    const role = (req.query.role as "admin" | "consultor") || undefined;
    const status = (req.query.status as "habilitado" | "inhabilitado") || undefined;
    const sortBy = (req.query.sortBy as "nombre" | "apellido") || "nombre";
    const sortOrder = (req.query.sortOrder as "ASC" | "DESC") || "ASC";

    const result = await getUsers(page, limit, search, role, status, sortBy, sortOrder);
    return sendSuccess(res, result, "Usuarios obtenidos correctamente");
  } catch (error: any) {
    return sendError(res, error.message || "Error al obtener usuarios");
  }
};

// Actualizar usuario
export const updateUserController = async (req: Request, res: Response) => {
  try {
    const userData = req.body;
    const updatedUser = await updateUser(userData);
    return sendSuccess(res, updatedUser, "Usuario actualizado correctamente");
  } catch (error: any) {
    return sendError(res, error.message || "Error al actualizar usuario");
  }
};