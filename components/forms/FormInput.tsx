'use client'

import { useMemo, forwardRef, useState } from 'react'

interface FormInputProps {
  type?: string
  placeholder?: string
  label?: string
  required?: boolean
  minLength?: number
  maxLength?: number
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  autoFocus?: boolean
  className?: string
  style?: React.CSSProperties
  compareValue?: string // Valor para comparar (útil para confirmar contraseña)
  customValidation?: (value: string) => boolean // Función de validación personalizada
  showPasswordToggle?: boolean // Mostrar botón para mostrar/ocultar contraseña
}

// Función para validar el valor según el tipo de input
function validateInput(value: string, type: string, required: boolean, minLength?: number, maxLength?: number): boolean {
  if (!value) {
    return !required // Si no es requerido, está "válido" cuando está vacío
  }

  // Validación de email
  if (type === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value)
  }

  // Validación de teléfono (opcional, pero si tiene valor debe tener al menos 8 dígitos)
  if (type === 'tel') {
    if (!value) return true // Opcional
    const phoneRegex = /^[\d\s\-\+\(\)]{8,}$/
    return phoneRegex.test(value)
  }

  // Validación de contraseña
  if (type === 'password') {
    if (minLength && value.length < minLength) return false
    return true
  }

  // Validación de texto (nombre completo, código, etc.)
  if (type === 'text') {
    // Si tiene maxLength (como código de 6 dígitos), debe cumplir exactamente
    if (maxLength && maxLength === 6) {
      return /^\d{6}$/.test(value) // Exactamente 6 dígitos
    }
    // Para otros textos, mínimo 2 caracteres
    if (minLength && value.length < minLength) return false
    return value.length >= 2
  }

  // Validación por longitud
  if (minLength && value.length < minLength) return false
  if (maxLength && value.length > maxLength) return false

  return true
}

export default forwardRef<HTMLInputElement, FormInputProps>(function FormInput({
  type = 'text',
  placeholder,
  label,
  required = false,
  minLength,
  maxLength,
  value = '',
  onChange,
  autoFocus = false,
  className = '',
  style,
  compareValue,
  customValidation,
  showPasswordToggle = false
}, ref) {
  const [showPassword, setShowPassword] = useState(false)
  const inputType = showPasswordToggle && type === 'password' ? (showPassword ? 'text' : 'password') : type

  const isValid = useMemo(() => {
    // Si hay una validación personalizada, usarla
    if (customValidation) {
      return customValidation(value)
    }
    
    // Si hay un valor para comparar (como confirmar contraseña)
    if (compareValue !== undefined) {
      if (!value) {
        return !required
      }
      return value === compareValue
    }
    
    // Validación estándar
    return validateInput(value, type, required, minLength, maxLength)
  }, [value, type, required, minLength, maxLength, compareValue, customValidation])

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <div className="form-input-wrapper">
        <input
          ref={ref}
          type={inputType}
          placeholder={placeholder}
          className={`form-input ${className} ${isValid && value ? 'form-input-valid' : ''} ${showPasswordToggle ? 'form-input-with-toggle' : ''}`}
          required={required}
          minLength={minLength}
          maxLength={maxLength}
          value={value}
          onChange={onChange}
          autoFocus={autoFocus}
          style={style}
        />
        {showPasswordToggle && (
          <button
            type="button"
            className="form-input-password-toggle"
            onClick={togglePasswordVisibility}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPassword ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 3.75C13.75 3.75 16.875 6.25 18.125 10C16.875 13.75 13.75 16.25 10 16.25C6.25 16.25 3.125 13.75 1.875 10C3.125 6.25 6.25 3.75 10 3.75Z" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2.5 2.5L17.5 17.5" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 3.75C13.75 3.75 16.875 6.25 18.125 10C16.875 13.75 13.75 16.25 10 16.25C6.25 16.25 3.125 13.75 1.875 10C3.125 6.25 6.25 3.75 10 3.75Z" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        )}
        {isValid && value && !showPasswordToggle && (
          <div className="form-input-check">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="8" cy="8" r="8" fill="#BF5065"/>
              <path d="M5 8L7 10L11 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}
        {isValid && value && showPasswordToggle && (
          <div className="form-input-check form-input-check-with-toggle">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="8" cy="8" r="8" fill="#BF5065"/>
              <path d="M5 8L7 10L11 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}
      </div>
    </div>
  )
})

