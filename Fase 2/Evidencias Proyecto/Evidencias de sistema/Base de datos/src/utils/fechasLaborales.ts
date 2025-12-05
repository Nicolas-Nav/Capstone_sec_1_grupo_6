/**
 * Utilidades para manejo de fechas laborales
 * Calcula días hábiles excluyendo fines de semana y feriados chilenos
 */

import FeriadosService from '@/services/feriadosService';

export class FechasLaborales {
    /**
     * Suma días hábiles a una fecha (excluyendo fines de semana y feriados)
     * @param fechaBase - Fecha de inicio
     * @param diasHabiles - Número de días hábiles a sumar
     * @returns Nueva fecha con los días hábiles sumados
     */
    static async sumarDiasHabiles(fechaBase: Date, diasHabiles: number): Promise<Date> {
        // Si duración es 0, retornar la fecha base (hito inmediato)
        if (diasHabiles === 0) {
            return new Date(fechaBase);
        }
        
        const fechaLimite = new Date(fechaBase);
        let diasAgregados = 0;
        
        while (diasAgregados < diasHabiles) {
            // Avanzar al siguiente día
            fechaLimite.setDate(fechaLimite.getDate() + 1);
            
            // Verificar si es día hábil (no fin de semana ni feriado)
            const esHabil = await this.esDiaHabil(fechaLimite);
            
            // Si es día hábil, incrementar el contador
            if (esHabil) {
                diasAgregados++;
            }
        }
        
        // Asegurar que la fecha límite final no caiga en fin de semana ni feriado
        while (!(await this.esDiaHabil(fechaLimite))) {
            fechaLimite.setDate(fechaLimite.getDate() + 1);
        }
        
        return fechaLimite;
    }
    
    /**
     * Calcula días hábiles entre dos fechas (excluyendo fines de semana y feriados)
     * @param fechaInicio - Fecha de inicio
     * @param fechaFin - Fecha de fin
     * @returns Número de días hábiles entre las fechas
     */
    static async calcularDiasHabiles(fechaInicio: Date, fechaFin: Date): Promise<number> {
        let diasHabiles = 0;
        const fechaActual = new Date(fechaInicio);
        
        while (fechaActual < fechaFin) {
            if (await this.esDiaHabil(fechaActual)) {
                diasHabiles++;
            }
            fechaActual.setDate(fechaActual.getDate() + 1);
        }
        
        return diasHabiles;
    }
    
    /**
     * Verifica si una fecha es día hábil (no fin de semana ni feriado)
     * @param fecha - Fecha a verificar
     * @returns true si es día hábil, false si es fin de semana o feriado
     */
    static async esDiaHabil(fecha: Date): Promise<boolean> {
        const diaSemana = fecha.getDay();
        
        // Si es fin de semana, no es hábil
        if (diaSemana === 0 || diaSemana === 6) {
            return false;
        }
        
        // Verificar si es feriado
        const esFeriado = await FeriadosService.esFeriado(fecha);
        
        // Es hábil si no es fin de semana ni feriado
        return !esFeriado;
    }
    
    /**
     * Calcula horas restantes hasta fecha límite
     * @param fechaLimite - Fecha límite
     * @returns Horas restantes (puede ser negativo si ya pasó)
     */
    static calcularHorasRestantes(fechaLimite: Date): number {
        const ahora = new Date();
        const diffMs = fechaLimite.getTime() - ahora.getTime();
        const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
        return diffHoras;
    }
    
    /**
     * Obtiene el próximo día hábil (excluyendo fines de semana y feriados)
     * @param fecha - Fecha de referencia
     * @returns Próximo día hábil
     */
    static async obtenerProximoDiaHabil(fecha: Date): Promise<Date> {
        const proximoDia = new Date(fecha);
        
        do {
            proximoDia.setDate(proximoDia.getDate() + 1);
        } while (!(await this.esDiaHabil(proximoDia)));
        
        return proximoDia;
    }
    
    /**
     * Formatea fecha para mostrar en alertas
     * @param fecha - Fecha a formatear
     * @returns String con fecha formateada
     */
    static formatearFecha(fecha: Date): string {
        return fecha.toLocaleDateString('es-CL', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    /**
     * Obtiene información completa sobre un día (si es hábil, feriado, etc.)
     * @param fecha - Fecha a consultar
     * @returns Objeto con información del día
     */
    static async obtenerInfoDia(fecha: Date): Promise<{
        esHabil: boolean;
        esFinDeSemana: boolean;
        esFeriado: boolean;
        nombreFeriado?: string;
    }> {
        const diaSemana = fecha.getDay();
        const esFinDeSemana = diaSemana === 0 || diaSemana === 6;
        const esFeriado = await FeriadosService.esFeriado(fecha);
        const nombreFeriado = esFeriado ? await FeriadosService.obtenerNombreFeriado(fecha) : undefined;
        const esHabil = !esFinDeSemana && !esFeriado;

        return {
            esHabil,
            esFinDeSemana,
            esFeriado,
            nombreFeriado: nombreFeriado || undefined
        };
    }

    /**
     * Pre-carga los feriados para mejorar el rendimiento
     * Se recomienda llamar al iniciar la aplicación
     */
    static async precargarFeriados(): Promise<void> {
        await FeriadosService.precargarFeriados();
    }

    /**
     * Obtiene todos los días no hábiles en un rango de fechas
     * @param fechaInicio - Fecha de inicio
     * @param fechaFin - Fecha de fin
     * @returns Array de fechas no hábiles con información
     */
    static async obtenerDiasNoHabiles(fechaInicio: Date, fechaFin: Date): Promise<Array<{
        fecha: Date;
        tipo: 'fin_de_semana' | 'feriado';
        nombre?: string;
    }>> {
        const diasNoHabiles: Array<{
            fecha: Date;
            tipo: 'fin_de_semana' | 'feriado';
            nombre?: string;
        }> = [];

        const fechaActual = new Date(fechaInicio);

        while (fechaActual <= fechaFin) {
            const info = await this.obtenerInfoDia(fechaActual);
            
            if (!info.esHabil) {
                if (info.esFeriado) {
                    diasNoHabiles.push({
                        fecha: new Date(fechaActual),
                        tipo: 'feriado',
                        nombre: info.nombreFeriado
                    });
                } else if (info.esFinDeSemana) {
                    diasNoHabiles.push({
                        fecha: new Date(fechaActual),
                        tipo: 'fin_de_semana'
                    });
                }
            }
            
            fechaActual.setDate(fechaActual.getDate() + 1);
        }

        return diasNoHabiles;
    }
}
