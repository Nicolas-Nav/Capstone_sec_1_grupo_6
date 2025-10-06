import { Response } from 'express';
import { ApiResponse, PaginatedResponse } from '@/types';

/**
 * Envía una respuesta exitosa
 */
export const sendSuccess = <T>(
  res: Response,
  data: T,
  message: string = 'Operación exitosa',
  statusCode: number = 200
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data
  };
  return res.status(statusCode).json(response);
};

/**
 * Envía una respuesta de error
 */
export const sendError = (
  res: Response,
  message: string = 'Error interno del servidor',
  statusCode: number = 500,
  error?: string
): Response => {
  const response: ApiResponse = {
    success: false,
    message,
    error
  };
  return res.status(statusCode).json(response);
};

/**
 * Envía una respuesta paginada
 */
export const sendPaginated = <T>(
  res: Response,
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  },
  message: string = 'Datos obtenidos exitosamente'
): void => {
  const response: PaginatedResponse<T> = {
    success: true,
    message,
    data,
    pagination
  };
  res.status(200).json(response);
};

/**
 * Envía una respuesta de validación
 */
export const sendValidationError = (
  res: Response,
  errors: Array<{ field: string; message: string }>,
  message: string = 'Errores de validación'
): void => {
  const response: ApiResponse = {
    success: false,
    message,
    error: 'VALIDATION_ERROR',
    data: { errors }
  };
  res.status(400).json(response);
};

/**
 * Envía una respuesta de no encontrado
 */
export const sendNotFound = (
  res: Response,
  message: string = 'Recurso no encontrado'
): void => {
  const response: ApiResponse = {
    success: false,
    message
  };
  res.status(404).json(response);
};

/**
 * Envía una respuesta de no autorizado
 */
export const sendUnauthorized = (
  res: Response,
  message: string = 'No autorizado'
): void => {
  const response: ApiResponse = {
    success: false,
    message
  };
  res.status(401).json(response);
};

/**
 * Envía una respuesta de prohibido
 */
export const sendForbidden = (
  res: Response,
  message: string = 'Acceso prohibido'
): void => {
  const response: ApiResponse = {
    success: false,
    message
  };
  res.status(403).json(response);
};

