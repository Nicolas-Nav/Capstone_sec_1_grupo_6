import { Request, Response, NextFunction } from 'express';
import { setCurrentUserContext } from '@/utils/userContext';

/**
 * Middleware para capturar el usuario autenticado y establecerlo en el contexto
 * Este middleware debe ejecutarse DESPUÉS del middleware de autenticación (authenticateToken)
 */
export const captureUserContext = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Si el usuario está autenticado, establecer su RUT en el contexto
  if (req.user && req.user.id) {
    setCurrentUserContext(req.user.id);
    console.log(`🔐 Usuario ${req.user.id} establecido en contexto para ${req.method} ${req.path}`);
  }
  
  next();
};


