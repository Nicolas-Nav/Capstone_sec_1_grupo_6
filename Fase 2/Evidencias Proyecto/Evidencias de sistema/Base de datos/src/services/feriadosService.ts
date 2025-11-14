/**
 * Servicio para obtener feriados de Chile
 * Usa la API oficial del Gobierno de Chile
 * https://apis.digital.gob.cl/fl/feriados/{año}
 */

interface Feriado {
    fecha: string; // formato: "YYYY-MM-DD"
    nombre: string;
    tipo: 'Religioso' | 'Civil';
    irrenunciable?: '1' | '0';
    comentarios?: string;
}

class FeriadosService {
    private static cache: Map<number, Feriado[]> = new Map();
    private static cacheExpiration: Map<number, number> = new Map();
    private static CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas en ms
    private static API_URL = 'https://apis.digital.gob.cl/fl/feriados';

    /**
     * Obtiene los feriados de un año específico
     * @param año - Año para obtener feriados (por defecto: año actual)
     * @returns Array de feriados
     */
    static async obtenerFeriados(año?: number): Promise<Feriado[]> {
        const añoConsulta = año || new Date().getFullYear();

        // Verificar si hay datos en caché válidos
        if (this.cache.has(añoConsulta)) {
            const expiracion = this.cacheExpiration.get(añoConsulta);
            if (expiracion && Date.now() < expiracion) {
                return this.cache.get(añoConsulta)!;
            }
        }

        try {
            const response = await fetch(`${this.API_URL}/${añoConsulta}`, {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'LLConsulting-App/1.0'
                }
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const feriados: Feriado[] = await response.json();
            
            // Guardar en caché
            this.cache.set(añoConsulta, feriados);
            this.cacheExpiration.set(añoConsulta, Date.now() + this.CACHE_DURATION);
            
            return feriados;
        } catch (error) {
            // Si hay datos en caché (aunque estén expirados), usarlos como fallback
            if (this.cache.has(añoConsulta)) {
                return this.cache.get(añoConsulta)!;
            }
            
            // Si no hay caché, retornar array vacío
            return [];
        }
    }

    /**
     * Verifica si una fecha es feriado
     * @param fecha - Fecha a verificar
     * @returns true si es feriado, false si no
     */
    static async esFeriado(fecha: Date): Promise<boolean> {
        const año = fecha.getFullYear();
        const feriados = await this.obtenerFeriados(año);
        
        const fechaStr = this.formatearFecha(fecha);
        return feriados.some(f => f.fecha === fechaStr);
    }

    /**
     * Obtiene el nombre del feriado si existe
     * @param fecha - Fecha a consultar
     * @returns Nombre del feriado o null si no es feriado
     */
    static async obtenerNombreFeriado(fecha: Date): Promise<string | null> {
        const año = fecha.getFullYear();
        const feriados = await this.obtenerFeriados(año);
        
        const fechaStr = this.formatearFecha(fecha);
        const feriado = feriados.find(f => f.fecha === fechaStr);
        
        return feriado ? feriado.nombre : null;
    }

    /**
     * Obtiene todos los feriados entre dos fechas
     * @param fechaInicio - Fecha de inicio
     * @param fechaFin - Fecha de fin
     * @returns Array de feriados en el rango
     */
    static async obtenerFeriadosEnRango(fechaInicio: Date, fechaFin: Date): Promise<Feriado[]> {
        const añoInicio = fechaInicio.getFullYear();
        const añoFin = fechaFin.getFullYear();
        
        // Obtener feriados de todos los años en el rango
        const todosLosFeriados: Feriado[] = [];
        for (let año = añoInicio; año <= añoFin; año++) {
            const feriadosAño = await this.obtenerFeriados(año);
            todosLosFeriados.push(...feriadosAño);
        }
        
        // Filtrar solo los feriados dentro del rango de fechas
        const fechaInicioStr = this.formatearFecha(fechaInicio);
        const fechaFinStr = this.formatearFecha(fechaFin);
        
        return todosLosFeriados.filter(f => 
            f.fecha >= fechaInicioStr && f.fecha <= fechaFinStr
        );
    }

    /**
     * Pre-carga los feriados de un año (útil para inicialización)
     * @param año - Año a pre-cargar (por defecto: año actual)
     */
    static async precargarFeriados(año?: number): Promise<void> {
        const añoActual = año || new Date().getFullYear();
        
        // Pre-cargar año actual y siguiente
        await this.obtenerFeriados(añoActual);
        await this.obtenerFeriados(añoActual + 1);
    }

    /**
     * Limpia la caché de feriados
     */
    static limpiarCache(): void {
        this.cache.clear();
        this.cacheExpiration.clear();
    }

    /**
     * Formatea una fecha a string YYYY-MM-DD
     * @param fecha - Fecha a formatear
     * @returns String en formato YYYY-MM-DD
     */
    private static formatearFecha(fecha: Date): string {
        const año = fecha.getFullYear();
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const dia = String(fecha.getDate()).padStart(2, '0');
        return `${año}-${mes}-${dia}`;
    }

    /**
     * Obtiene estadísticas de la caché
     * @returns Información sobre el estado de la caché
     */
    static obtenerEstadisticasCache(): {
        añosCacheados: number[];
        totalFeriados: number;
        cacheValido: boolean;
    } {
        const añosCacheados = Array.from(this.cache.keys());
        const totalFeriados = Array.from(this.cache.values()).reduce(
            (total, feriados) => total + feriados.length,
            0
        );
        
        // Verificar si hay al menos un caché válido
        const cacheValido = Array.from(this.cacheExpiration.values()).some(
            expiracion => Date.now() < expiracion
        );
        
        return {
            añosCacheados,
            totalFeriados,
            cacheValido
        };
    }
}

export default FeriadosService;
export type { Feriado };

