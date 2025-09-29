import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { sendValidationError } from '@/utils/response';

/**
 * Middleware para manejar errores de validación
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.type === 'field' ? error.path : 'unknown',
      message: error.msg
    }));
    
    sendValidationError(res, formattedErrors);
    return;
  }
  
  next();
};

/**
 * Función helper para ejecutar validaciones
 */
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Ejecutar todas las validaciones
    for (const validation of validations) {
      await validation.run(req);
    }
    
    // Manejar errores
    handleValidationErrors(req, res, next);
  };
};

/**
 * Middleware para validar paginación
 */
export const validatePagination = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  
  // Validar límites
  if (page < 1) {
    sendValidationError(res, [{ field: 'page', message: 'La página debe ser mayor a 0' }]);
    return;
  }
  
  if (limit < 1 || limit > 100) {
    sendValidationError(res, [{ field: 'limit', message: 'El límite debe estar entre 1 y 100' }]);
    return;
  }
  
  // Agregar valores validados a la request
  req.query.page = page.toString();
  req.query.limit = limit.toString();
  
  next();
};
