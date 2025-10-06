import { Request, Response, NextFunction } from 'express';
import { sendError } from '@/utils/response';
import { Logger } from '@/utils/logger';

/**
 * Middleware para manejo global de errores
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log del error
  console.error('=== ERROR HANDLER MIDDLEWARE ===');
  console.error('Error completo:', err);
  console.error('Request URL:', req.url);
  console.error('Request method:', req.method);
  console.error('Request body:', req.body);
  
  Logger.error('Error no manejado:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query
  });

  // Error de validación de Sequelize
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map((error: any) => ({
      field: error.path,
      message: error.message
    }));
    
    res.status(400).json({
      success: false,
      message: 'Errores de validación',
      error: 'VALIDATION_ERROR',
      data: { errors }
    });
    return;
  }

  // Error de clave única de Sequelize
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0]?.path || 'campo';
    res.status(400).json({
      success: false,
      message: `El ${field} ya existe`,
      error: 'UNIQUE_CONSTRAINT_ERROR'
    });
    return;
  }

  // Error de clave foránea de Sequelize
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    res.status(400).json({
      success: false,
      message: 'Error de referencia: el recurso relacionado no existe',
      error: 'FOREIGN_KEY_ERROR'
    });
    return;
  }

  // Error de JWT
  if (err.name === 'JsonWebTokenError') {
    sendError(res, 'Token inválido', 401);
    return;
  }

  if (err.name === 'TokenExpiredError') {
    sendError(res, 'Token expirado', 401);
    return;
  }

  // Error de sintaxis JSON
  if (err.type === 'entity.parse.failed') {
    sendError(res, 'JSON inválido en el cuerpo de la petición', 400);
    return;
  }

  // Error de límite de archivo
  if (err.code === 'LIMIT_FILE_SIZE') {
    sendError(res, 'El archivo es demasiado grande', 413);
    return;
  }

  // Error por defecto
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Error interno del servidor';
  
  sendError(res, message, statusCode, process.env.NODE_ENV === 'development' ? err.stack : undefined);
};

/**
 * Middleware para manejar rutas no encontradas
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.path}`,
    error: 'NOT_FOUND'
  });
};

/**
 * Middleware para capturar errores asíncronos
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
