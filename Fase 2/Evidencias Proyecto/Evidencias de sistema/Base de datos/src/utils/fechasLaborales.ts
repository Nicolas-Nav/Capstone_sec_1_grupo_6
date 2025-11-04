/**
 * Utilidades para manejo de fechas laborales
 * Calcula días hábiles excluyendo fines de semana
 */

export class FechasLaborales {
    /**
     * Suma días hábiles a una fecha (excluyendo fines de semana)
     * @param fechaBase - Fecha de inicio
     * @param diasHabiles - Número de días hábiles a sumar
     * @returns Nueva fecha con los días hábiles sumados
     */
    static sumarDiasHabiles(fechaBase: Date, diasHabiles: number): Date {
        // Si duración es 0, retornar la fecha base (hito inmediato)
        if (diasHabiles === 0) {
            return new Date(fechaBase);
        }
        
        const fechaLimite = new Date(fechaBase);
        let diasAgregados = 0;
        
        while (diasAgregados < diasHabiles) {
            // Avanzar al siguiente día
            fechaLimite.setDate(fechaLimite.getDate() + 1);
            
            // Verificar si es día hábil
            const diaSemana = fechaLimite.getDay();
            const esHabil = diaSemana !== 0 && diaSemana !== 6; // No es domingo ni sábado
            
            // Si es día hábil, incrementar el contador
            if (esHabil) {
                diasAgregados++;
            }
        }
        
        // Asegurar que la fecha límite final no caiga en fin de semana
        while (fechaLimite.getDay() === 0 || fechaLimite.getDay() === 6) {
            fechaLimite.setDate(fechaLimite.getDate() + 1);
        }
        
        return fechaLimite;
    }
    
    /**
     * Calcula días hábiles entre dos fechas
     * @param fechaInicio - Fecha de inicio
     * @param fechaFin - Fecha de fin
     * @returns Número de días hábiles entre las fechas
     */
    static calcularDiasHabiles(fechaInicio: Date, fechaFin: Date): number {
        let diasHabiles = 0;
        const fechaActual = new Date(fechaInicio);
        
        while (fechaActual < fechaFin) {
            if (fechaActual.getDay() !== 0 && fechaActual.getDay() !== 6) {
                diasHabiles++;
            }
            fechaActual.setDate(fechaActual.getDate() + 1);
        }
        
        return diasHabiles;
    }
    
    /**
     * Verifica si una fecha es día hábil
     * @param fecha - Fecha a verificar
     * @returns true si es día hábil, false si es fin de semana
     */
    static esDiaHabil(fecha: Date): boolean {
        const diaSemana = fecha.getDay();
        return diaSemana !== 0 && diaSemana !== 6; // No es domingo ni sábado
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
     * Obtiene el próximo día hábil
     * @param fecha - Fecha de referencia
     * @returns Próximo día hábil
     */
    static obtenerProximoDiaHabil(fecha: Date): Date {
        const proximoDia = new Date(fecha);
        
        do {
            proximoDia.setDate(proximoDia.getDate() + 1);
        } while (!this.esDiaHabil(proximoDia));
        
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
}
