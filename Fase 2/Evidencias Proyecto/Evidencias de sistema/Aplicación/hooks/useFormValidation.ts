import { useState, useCallback } from 'react'
import { validateRut } from '@/lib/utils'

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => string | null
  message?: string
}

export interface ValidationSchema {
  [key: string]: ValidationRule
}

export interface ValidationErrors {
  [key: string]: string | ValidationErrors | { [key: number]: ValidationErrors }
}

export interface UseFormValidationReturn {
  errors: ValidationErrors
  validateField: (field: string, value: any, schema?: ValidationSchema) => void
  validateAllFields: (data: any, schema: ValidationSchema) => boolean
  clearError: (field: string) => void
  clearAllErrors: () => void
  hasErrors: () => boolean
}

// Reglas de validación predefinidas
export const validationRules = {
  required: (message = 'Este campo es requerido'): ValidationRule => ({
    required: true,
    message
  }),
  
  minLength: (min: number, message?: string): ValidationRule => ({
    minLength: min,
    message: message || `Debe tener al menos ${min} caracteres`
  }),
  
  maxLength: (max: number, message?: string): ValidationRule => ({
    maxLength: max,
    message: message || `No puede exceder ${max} caracteres`
  }),
  
  email: (message = 'Ingrese un email válido'): ValidationRule => ({
    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    message
  }),
  
  phone: (message = 'Ingrese un teléfono válido (mínimo 8 dígitos)'): ValidationRule => ({
    pattern: /^[\+]?[0-9\s\-\(\)]{8,}$/,
    message
  }),
  
  rut: (message = 'Ingrese un RUT válido (ej: 12345678-9)'): ValidationRule => ({
    custom: (value: string) => {
      if (!value?.trim()) return null
      return validateRut(value) ? null : message
    }
  }),
  
  number: (min?: number, max?: number, message?: string): ValidationRule => ({
    custom: (value: any) => {
      const num = Number(value)
      if (isNaN(num)) return message || 'Debe ser un número válido'
      if (min !== undefined && num < min) return message || `Debe ser mayor o igual a ${min}`
      if (max !== undefined && num > max) return message || `Debe ser menor o igual a ${max}`
      return null
    }
  }),
  
  textLength: (min: number, max: number, fieldName = 'campo'): ValidationRule => ({
    minLength: min,
    maxLength: max,
    message: `${fieldName} debe tener entre ${min} y ${max} caracteres`
  }),
  
  requiredTextLength: (min: number, max: number, fieldName = 'campo'): ValidationRule => ({
    required: true,
    minLength: min,
    maxLength: max,
    message: `${fieldName} es requerido y debe tener entre ${min} y ${max} caracteres`
  })
}

// Esquemas de validación predefinidos
export const validationSchemas = {
  // Validaciones para formulario de proceso
  processForm: {
    client_id: validationRules.required('Seleccione un cliente con al menos 1 contacto'),
    contact_id: validationRules.required('Debe seleccionar un contacto'),
    service_type: validationRules.required('Debe seleccionar un tipo de servicio'),
    position_title: validationRules.required('Debe seleccionar o ingresar un cargo'),
    region: validationRules.required('Debe seleccionar una región'),
    ciudad: validationRules.required('Debe seleccionar una ciudad/comuna'),
    consultant_id: validationRules.required('Debe seleccionar un consultor'),
    vacancies: validationRules.number(1, undefined, 'Debe ingresar al menos 1 vacante'),
    description: validationRules.requiredTextLength(10, 500, 'La descripción'),
    requirements: validationRules.requiredTextLength(10, 500, 'Los requisitos')
  },
  
  // Validaciones para candidatos
  candidateForm: {
    nombre_candidato: validationRules.required('Debe ingresar el nombre del candidato'),
    primer_apellido_candidato: validationRules.required('Debe ingresar el primer apellido del candidato'),
    segundo_apellido_candidato: validationRules.required('Debe ingresar el segundo apellido del candidato'),
    telefono_candidato: {
      ...validationRules.required('Debe ingresar el teléfono del candidato'),
      ...validationRules.phone()
    },
    email_candidato: {
      ...validationRules.required('Debe ingresar el email del candidato'),
      ...validationRules.email('Ingrese un email válido (ej: candidato@ejemplo.com)')
    },
    rut_candidato: validationRules.rut()
  }
}

export function useFormValidation(): UseFormValidationReturn {
  const [errors, setErrors] = useState<ValidationErrors>({})

  const validateField = useCallback((field: string, value: any, schema?: ValidationSchema) => {
    if (!schema) return

    const rule = schema[field]
    if (!rule) return

    const newErrors = { ...errors }
    const errorMessage = validateSingleField(value, rule)

    if (errorMessage) {
      newErrors[field] = errorMessage
    } else {
      delete newErrors[field]
    }

    setErrors(newErrors)
  }, [errors])

  const validateAllFields = useCallback((data: any, schema: ValidationSchema): boolean => {
    const newErrors: ValidationErrors = {}
    let hasErrors = false

    Object.keys(schema).forEach(field => {
      const rule = schema[field]
      const value = data[field]
      const errorMessage = validateSingleField(value, rule)

      if (errorMessage) {
        newErrors[field] = errorMessage
        hasErrors = true
      }
    })

    setErrors(newErrors)
    return !hasErrors
  }, [])

  const clearError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
  }, [])

  const clearAllErrors = useCallback(() => {
    setErrors({})
  }, [])

  const hasErrors = useCallback(() => {
    return Object.keys(errors).length > 0
  }, [errors])

  return {
    errors,
    validateField,
    validateAllFields,
    clearError,
    clearAllErrors,
    hasErrors
  }
}

function validateSingleField(value: any, rule: ValidationRule): string | null {
  // Validación requerida
  if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
    return rule.message || 'Este campo es requerido'
  }

  // Si el campo no es requerido y está vacío, no validar más
  if (!rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
    return null
  }

  // Validación de longitud mínima
  if (rule.minLength && typeof value === 'string' && value.trim().length < rule.minLength) {
    return rule.message || `Debe tener al menos ${rule.minLength} caracteres`
  }

  // Validación de longitud máxima
  if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
    return rule.message || `No puede exceder ${rule.maxLength} caracteres`
  }

  // Validación de patrón
  if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value.trim())) {
    return rule.message || 'Formato inválido'
  }

  // Validación personalizada
  if (rule.custom) {
    return rule.custom(value)
  }

  return null
}

// Función helper para validar candidatos específicamente
export function validateCandidates(candidates: any[]): { hasErrors: boolean; errors: ValidationErrors } {
  const errors: ValidationErrors = {}
  let hasErrors = false

  if (candidates.length === 0) {
    errors.general = 'Debe agregar al menos un candidato para evaluar'
    hasErrors = true
  } else {
    candidates.forEach((candidate, index) => {
      const candidateErrors: ValidationErrors = {}
      let candidateHasErrors = false

      // Validar cada campo del candidato
      Object.keys(validationSchemas.candidateForm).forEach(field => {
        const rule = validationSchemas.candidateForm[field as keyof typeof validationSchemas.candidateForm]
        const value = candidate[field as keyof typeof candidate]
        const errorMessage = validateSingleField(value, rule)

        if (errorMessage) {
          candidateErrors[field] = errorMessage
          candidateHasErrors = true
        }
      })

      if (candidateHasErrors) {
        errors[index] = candidateErrors
        hasErrors = true
      }
    })
  }

  return { hasErrors, errors }
}