import { AsyncLocalStorage } from 'async_hooks';

/**
 * Almacenamiento local asíncrono para mantener el contexto del usuario
 * a través de todas las operaciones asíncronas
 */
export const userContext = new AsyncLocalStorage<string>();

/**
 * Establece el RUT del usuario actual en el contexto
 * @param rutUsuario RUT del usuario autenticado
 */
export function setCurrentUserContext(rutUsuario: string): void {
    userContext.enterWith(rutUsuario);
}

/**
 * Obtiene el RUT del usuario actual desde el contexto
 * @returns RUT del usuario o null si no hay contexto
 */
export function getCurrentUserContext(): string | null {
    return userContext.getStore() || null;
}

/**
 * Limpia el contexto del usuario actual
 */
export function clearCurrentUserContext(): void {
    userContext.exit(() => {});
}


