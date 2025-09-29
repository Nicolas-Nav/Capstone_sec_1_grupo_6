import fs from 'fs';
import path from 'path';

/**
 * Utilidad para logging personalizado
 */
export class Logger {
  private static logDir = path.join(process.cwd(), 'logs');

  /**
   * Asegura que el directorio de logs existe
   */
  private static ensureLogDir(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * Obtiene la fecha actual formateada
   */
  private static getTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Escribe un log a archivo
   */
  private static writeToFile(level: string, message: string, data?: any): void {
    this.ensureLogDir();
    
    const logEntry = {
      timestamp: this.getTimestamp(),
      level,
      message,
      data: data || null
    };

    const logFile = path.join(this.logDir, `${level}.log`);
    const logLine = JSON.stringify(logEntry) + '\n';
    
    fs.appendFileSync(logFile, logLine);
  }

  /**
   * Log de información
   */
  static info(message: string, data?: any): void {
    console.log(`[INFO] ${message}`, data || '');
    this.writeToFile('info', message, data);
  }

  /**
   * Log de advertencia
   */
  static warn(message: string, data?: any): void {
    console.warn(`[WARN] ${message}`, data || '');
    this.writeToFile('warn', message, data);
  }

  /**
   * Log de error
   */
  static error(message: string, error?: any): void {
    console.error(`[ERROR] ${message}`, error || '');
    this.writeToFile('error', message, error);
  }

  /**
   * Log de debug
   */
  static debug(message: string, data?: any): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, data || '');
      this.writeToFile('debug', message, data);
    }
  }

  /**
   * Log de cambios en la base de datos
   */
  static logChange(
    tabla: string,
    idRegistro: string,
    accion: 'CREATE' | 'UPDATE' | 'DELETE',
    detalle: string,
    usuario: string
  ): void {
    const message = `${accion} en ${tabla} - ID: ${idRegistro}`;
    const data = {
      tabla_afectada: tabla,
      id_registro: idRegistro,
      accion,
      detalle_cambio: detalle,
      usuario_responsable: usuario
    };

    this.info(message, data);
  }
}
