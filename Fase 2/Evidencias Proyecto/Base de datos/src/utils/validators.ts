/**
 * Utilidades de validación personalizadas
 */

/**
 * Valida RUT chileno
 */
export const validateRut = (rut: string): boolean => {
  // Limpiar RUT
  const cleanRut = rut.replace(/[^0-9kK]/g, '');
  
  if (cleanRut.length < 8 || cleanRut.length > 9) {
    return false;
  }

  const rutNumber = cleanRut.slice(0, -1);
  const dv = cleanRut.slice(-1).toUpperCase();

  // Calcular dígito verificador
  let sum = 0;
  let multiplier = 2;

  for (let i = rutNumber.length - 1; i >= 0; i--) {
    sum += parseInt(rutNumber[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const remainder = sum % 11;
  const calculatedDv = remainder === 0 ? '0' : remainder === 1 ? 'K' : (11 - remainder).toString();

  return dv === calculatedDv;
};

/**
 * Valida edad mínima y máxima
 */
export const validateAge = (fechaNacimiento: Date, minAge: number = 18, maxAge: number = 85): boolean => {
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mesActual = hoy.getMonth();
  const mesNacimiento = nacimiento.getMonth();
  
  if (mesActual < mesNacimiento || (mesActual === mesNacimiento && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  
  return edad >= minAge && edad <= maxAge;
};

/**
 * Valida fecha en rango (desde X días atrás hasta futuro)
 */
export const validateDateRange = (fecha: Date, daysBack: number = 14): boolean => {
  const hoy = new Date();
  const fechaLimite = new Date();
  fechaLimite.setDate(hoy.getDate() - daysBack);
  
  return fecha >= fechaLimite;
};

/**
 * Valida valoración de 1 a 5
 */
export const validateRating = (valoracion: number): boolean => {
  return Number.isInteger(valoracion) && valoracion >= 1 && valoracion <= 5;
};
