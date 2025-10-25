import React from 'react'
import { useFormValidation, useProcessFormValidation, commonValidations } from '@/hooks/useFormValidation'
import { ValidatedInput, ValidatedTextarea, ValidatedSelect, CandidatoForm } from '@/components/ui/ValidatedFormComponents'
import { Button } from '@/components/ui/button'

// Ejemplo de formulario simplificado usando las validaciones estandarizadas
export function SimpleProcessForm() {
  const processRules = useProcessFormValidation()
  
  const {
    data: formData,
    errors,
    updateField,
    validateAll,
    clearErrors
  } = useFormValidation({
    client_id: '',
    contact_id: '',
    service_type: '',
    position_title: '',
    region: '',
    ciudad: '',
    description: '',
    requirements: '',
    vacancies: 1,
    consultant_id: ''
  }, processRules)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateAll()) {
      return // Hay errores de validación
    }

    // Enviar datos
    console.log('Datos válidos:', formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <ValidatedSelect
          id="client"
          label="Cliente"
          value={formData.client_id}
          onChange={(value) => updateField('client_id', value)}
          error={errors.client_id}
          placeholder="Seleccionar cliente"
          required
          options={[
            { value: '1', label: 'Cliente 1' },
            { value: '2', label: 'Cliente 2' }
          ]}
        />

        <ValidatedSelect
          id="service_type"
          label="Tipo de Servicio"
          value={formData.service_type}
          onChange={(value) => updateField('service_type', value)}
          error={errors.service_type}
          placeholder="Seleccionar servicio"
          required
          options={[
            { value: 'evaluacion', label: 'Evaluación' },
            { value: 'test', label: 'Test Psicolaboral' }
          ]}
        />
      </div>

      <ValidatedInput
        id="position_title"
        label="Cargo"
        value={formData.position_title}
        onChange={(value) => updateField('position_title', value)}
        error={errors.position_title}
        placeholder="Nombre del cargo"
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <ValidatedTextarea
          id="description"
          label="Descripción"
          value={formData.description}
          onChange={(value) => updateField('description', value)}
          error={errors.description}
          placeholder="Descripción del cargo"
          required
          maxLength={500}
        />

        <ValidatedTextarea
          id="requirements"
          label="Requisitos"
          value={formData.requirements}
          onChange={(value) => updateField('requirements', value)}
          error={errors.requirements}
          placeholder="Requisitos del cargo"
          required
          maxLength={500}
        />
      </div>

      <div className="flex gap-4">
        <Button type="submit">
          Crear Proceso
        </Button>
        <Button type="button" variant="outline" onClick={clearErrors}>
          Limpiar Errores
        </Button>
      </div>
    </form>
  )
}

// Ejemplo de formulario de candidato simplificado
export function SimpleCandidatoForm() {
  const candidatoRules = {
    nombre_candidato: commonValidations.name,
    primer_apellido_candidato: commonValidations.name,
    segundo_apellido_candidato: commonValidations.name,
    telefono_candidato: commonValidations.phone,
    email_candidato: commonValidations.email,
    rut_candidato: commonValidations.rut
  }

  const {
    data: candidato,
    errors,
    updateField,
    validateAll
  } = useFormValidation({
    rut_candidato: '',
    nombre_candidato: '',
    primer_apellido_candidato: '',
    segundo_apellido_candidato: '',
    telefono_candidato: '',
    email_candidato: '',
    discapacidad: false,
    cv_file: null
  }, candidatoRules)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateAll()) {
      return
    }

    console.log('Candidato válido:', candidato)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <ValidatedInput
          id="rut"
          label="RUT (Opcional)"
          value={candidato.rut_candidato}
          onChange={(value) => updateField('rut_candidato', value)}
          error={errors.rut_candidato}
          placeholder="12345678-9"
        />

        <ValidatedInput
          id="nombre"
          label="Nombre"
          value={candidato.nombre_candidato}
          onChange={(value) => updateField('nombre_candidato', value)}
          error={errors.nombre_candidato}
          placeholder="Nombre del candidato"
          required
        />

        <ValidatedInput
          id="primer_apellido"
          label="Primer Apellido"
          value={candidato.primer_apellido_candidato}
          onChange={(value) => updateField('primer_apellido_candidato', value)}
          error={errors.primer_apellido_candidato}
          placeholder="Primer apellido"
          required
        />

        <ValidatedInput
          id="segundo_apellido"
          label="Segundo Apellido"
          value={candidato.segundo_apellido_candidato}
          onChange={(value) => updateField('segundo_apellido_candidato', value)}
          error={errors.segundo_apellido_candidato}
          placeholder="Segundo apellido"
          required
        />

        <ValidatedInput
          id="telefono"
          label="Teléfono"
          value={candidato.telefono_candidato}
          onChange={(value) => updateField('telefono_candidato', value)}
          error={errors.telefono_candidato}
          placeholder="+56 9 1234 5678"
          required
        />

        <ValidatedInput
          id="email"
          label="Email"
          value={candidato.email_candidato}
          onChange={(value) => updateField('email_candidato', value)}
          error={errors.email_candidato}
          placeholder="candidato@ejemplo.com"
          type="email"
          required
        />
      </div>

      <Button type="submit">
        Guardar Candidato
      </Button>
    </form>
  )
}
