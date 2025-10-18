import React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ValidationErrors } from './useFormValidation'

interface ValidatedInputProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  required?: boolean
  error?: string
  className?: string
  disabled?: boolean
  min?: number
  max?: number
}

export function ValidatedInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  error,
  className = "",
  disabled = false,
  min,
  max
}: ValidatedInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        max={max}
        className={`${error ? "border-red-500" : ""} ${className}`}
      />
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}

interface ValidatedTextareaProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  error?: string
  className?: string
  rows?: number
  maxLength?: number
  showCharCount?: boolean
}

export function ValidatedTextarea({
  id,
  label,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  className = "",
  rows = 3,
  maxLength,
  showCharCount = false
}: ValidatedTextareaProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className={`resize-none overflow-wrap-anywhere ${error ? "border-red-500" : ""} ${className}`}
        style={{ 
          minHeight: '80px', 
          maxHeight: '200px',
          wordWrap: 'break-word',
          whiteSpace: 'pre-wrap',
          overflowWrap: 'anywhere'
        }}
      />
      <div className="flex justify-between items-center">
        <div>
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
        </div>
        {showCharCount && maxLength && (
          <p className={`text-xs ${value.length > maxLength ? 'text-red-500' : 'text-muted-foreground'}`}>
            {value.length}/{maxLength} caracteres
          </p>
        )}
      </div>
    </div>
  )
}

interface ValidatedSelectProps {
  id: string
  label: string
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  required?: boolean
  error?: string
  className?: string
  disabled?: boolean
  children: React.ReactNode
}

export function ValidatedSelect({
  id,
  label,
  value,
  onValueChange,
  placeholder,
  required = false,
  error,
  className = "",
  disabled = false,
  children
}: ValidatedSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Select
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger className={`${error ? "border-red-500" : ""} ${className}`}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {children}
        </SelectContent>
      </Select>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}

interface ValidatedSelectItemProps {
  value: string
  children: React.ReactNode
}

export function ValidatedSelectItem({ value, children }: ValidatedSelectItemProps) {
  return (
    <SelectItem value={value}>
      {children}
    </SelectItem>
  )
}

interface ValidationErrorDisplayProps {
  error?: string | ValidationErrors
  className?: string
}

export function ValidationErrorDisplay({ error, className = "" }: ValidationErrorDisplayProps) {
  if (!error) return null

  if (typeof error === 'string') {
    return (
      <p className={`text-sm text-red-500 ${className}`}>
        {error}
      </p>
    )
  }

  // Si es un objeto de errores, mostrar el primer error encontrado
  const firstError = Object.values(error).find(err => err)
  if (firstError && typeof firstError === 'string') {
    return (
      <p className={`text-sm text-red-500 ${className}`}>
        {firstError}
      </p>
    )
  }

  return null
}

interface ValidationSummaryProps {
  errors: ValidationErrors
  className?: string
}

export function ValidationSummary({ errors, className = "" }: ValidationSummaryProps) {
  const errorMessages: string[] = []

  const extractErrors = (errorObj: ValidationErrors, prefix = '') => {
    Object.keys(errorObj).forEach(key => {
      const error = errorObj[key]
      if (typeof error === 'string') {
        errorMessages.push(`${prefix}${key}: ${error}`)
      } else if (typeof error === 'object' && error !== null) {
        extractErrors(error, `${prefix}${key}.`)
      }
    })
  }

  extractErrors(errors)

  if (errorMessages.length === 0) return null

  return (
    <div className={`p-3 bg-red-50 border border-red-200 rounded-lg ${className}`}>
      <h4 className="text-sm font-medium text-red-800 mb-2">
        Errores de validación:
      </h4>
      <ul className="text-sm text-red-700 space-y-1">
        {errorMessages.map((message, index) => (
          <li key={index}>• {message}</li>
        ))}
      </ul>
    </div>
  )
}