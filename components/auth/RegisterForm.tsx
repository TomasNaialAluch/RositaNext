'use client'

import { useState, useEffect, useRef } from 'react'
import { auth, db } from '@/lib/firebase'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import FormInput from '@/components/forms/FormInput'
import AddressInput from '@/components/forms/AddressInput'
import RadioGroup from '@/components/forms/RadioGroup'
import { smoothScrollToElement } from '@/lib/scrollUtils'

interface GoogleUserData {
  email: string
  displayName: string
  photoURL: string | null
  isNewUser: boolean
}

interface RegisterFormProps {
  onSwitchToLogin: () => void
  onRegisterSuccess?: () => void
  isClosing?: boolean
  initialData?: GoogleUserData | null
}

export default function RegisterForm({ onSwitchToLogin, onRegisterSuccess, isClosing = false, initialData = null }: RegisterFormProps) {
  const [addressType, setAddressType] = useState<'casa' | 'departamento'>('casa')
  const departamentoFieldsRef = useRef<HTMLDivElement>(null)
  
  // Refs para los campos requeridos
  const fullNameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const confirmPasswordRef = useRef<HTMLInputElement>(null)
  
  // Estados para los campos del formulario
  const [fullName, setFullName] = useState(initialData?.displayName || '')
  const [email, setEmail] = useState(initialData?.email || '')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [address, setAddress] = useState('')
  const [floor, setFloor] = useState('')
  const [doorbell, setDoorbell] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleAddressTypeChange = (value: 'casa' | 'departamento') => {
    setAddressType(value)
  }

  // Función para validar campos
  const validateFields = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!fullName.trim() || fullName.trim().length < 2) {
      newErrors.fullName = 'El nombre completo es requerido'
    }

    if (!email.trim()) {
      newErrors.email = 'El email es requerido'
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        newErrors.email = 'El email no es válido'
      }
    }

    if (!password || password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Debes confirmar la contraseña'
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Función para hacer scroll al primer campo con error
  const scrollToFirstError = () => {
    const scrollContainer = document.querySelector('.auth-main-container') as HTMLElement
    if (!scrollContainer) return

    const fieldOrder = [
      { ref: fullNameRef, key: 'fullName' },
      { ref: emailRef, key: 'email' },
      { ref: passwordRef, key: 'password' },
      { ref: confirmPasswordRef, key: 'confirmPassword' }
    ]

    for (const field of fieldOrder) {
      if (errors[field.key] && field.ref.current) {
        setTimeout(() => {
          smoothScrollToElement(scrollContainer, field.ref.current!, 1000, -100)
        }, 100)
        break
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateFields()) {
      // Si hay errores, hacer scroll al primer campo con error
      setTimeout(() => {
        scrollToFirstError()
      }, 100)
      return
    }

    // Guardar usuario en Firestore
    if (auth?.currentUser && db) {
      try {
        const userRef = doc(db, 'users', auth.currentUser.uid)
        await setDoc(userRef, {
          email: email,
          fullName: fullName,
          phone: phone || null,
          address: address || null,
          addressType: addressType || null,
          floor: floor || null,
          doorbell: doorbell || null,
          photoURL: initialData?.photoURL || null,
          role: 'user',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
      } catch (error) {
        console.error('Error al guardar usuario en Firestore:', error)
        // Continuar aunque haya error para no bloquear el flujo
      }
    }

    // Si todo está válido, hacer scroll arriba y mostrar animación
    const scrollContainer = document.querySelector('.auth-main-container') as HTMLElement
    if (scrollContainer) {
      smoothScrollToElement(scrollContainer, scrollContainer, 800, 0)
    }

    // Esperar a que termine el scroll y mostrar animación
    setTimeout(() => {
      if (onRegisterSuccess) {
        onRegisterSuccess()
      }
    }, 1000)
  }

  // Actualizar los campos cuando cambien los datos iniciales
  useEffect(() => {
    if (initialData) {
      setFullName(initialData.displayName || '')
      setEmail(initialData.email || '')
    }
  }, [initialData])

  useEffect(() => {
    if (addressType === 'departamento' && departamentoFieldsRef.current) {
      // Esperar a que los inputs se rendericen completamente
      setTimeout(() => {
        const targetElement = departamentoFieldsRef.current
        if (!targetElement) return

        // Buscar el contenedor con scroll
        const scrollContainer = document.querySelector('.auth-main-container') as HTMLElement
        if (!scrollContainer) return

        // Usar la función utilitaria de scroll
        smoothScrollToElement(scrollContainer, targetElement, 2000, -100)
      }, 600)
    }
  }, [addressType])

  return (
    <div className={`register-form-container ${isClosing ? 'closing' : ''}`}>
      <form className="register-form-content" onSubmit={handleSubmit}>
        {/* Sección 1: Información básica */}
        <div className="form-section">
          <h3 className="form-section-title">Información básica</h3>
          
          <div>
            <FormInput
              ref={fullNameRef}
              type="text"
              label="Nombre completo *"
              placeholder="Nombre completo"
              required
              autoFocus={!initialData}
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value)
                if (errors.fullName) {
                  setErrors(prev => {
                    const newErrors = { ...prev }
                    delete newErrors.fullName
                    return newErrors
                  })
                }
              }}
            />
            {errors.fullName && (
              <div style={{ color: '#BF5065', fontSize: '0.875rem', marginTop: '-0.5rem', marginBottom: '0.5rem' }}>
                {errors.fullName}
              </div>
            )}
          </div>

          <div>
            <FormInput
              ref={emailRef}
              type="email"
              label="Email *"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email) {
                  setErrors(prev => {
                    const newErrors = { ...prev }
                    delete newErrors.email
                    return newErrors
                  })
                }
              }}
            />
            {errors.email && (
              <div style={{ color: '#BF5065', fontSize: '0.875rem', marginTop: '-0.5rem', marginBottom: '0.5rem' }}>
                {errors.email}
              </div>
            )}
          </div>

          <FormInput
            type="tel"
            label="WhatsApp"
            placeholder="WhatsApp (opcional)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <div>
            <FormInput
              ref={passwordRef}
              type="password"
              label="Contraseña *"
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
              value={password}
              showPasswordToggle
              onChange={(e) => {
                setPassword(e.target.value)
                if (errors.password) {
                  setErrors(prev => {
                    const newErrors = { ...prev }
                    delete newErrors.password
                    return newErrors
                  })
                }
              }}
            />
            {errors.password && (
              <div style={{ color: '#BF5065', fontSize: '0.875rem', marginTop: '-0.5rem', marginBottom: '0.5rem' }}>
                {errors.password}
              </div>
            )}
          </div>

          <div>
            <FormInput
              ref={confirmPasswordRef}
              type="password"
              label="Confirmar contraseña *"
              placeholder="Confirmar contraseña"
              required
              minLength={6}
              value={confirmPassword}
              compareValue={password}
              showPasswordToggle
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                if (errors.confirmPassword) {
                  setErrors(prev => {
                    const newErrors = { ...prev }
                    delete newErrors.confirmPassword
                    return newErrors
                  })
                }
              }}
            />
            {errors.confirmPassword && (
              <div style={{ color: '#BF5065', fontSize: '0.875rem', marginTop: '-0.5rem', marginBottom: '0.5rem' }}>
                {errors.confirmPassword}
              </div>
            )}
          </div>
        </div>

        {/* Sección 2: Dirección de entrega */}
        <div className="form-section">
          <h3 className="form-section-title">Dirección de entrega (opcional)</h3>
          
          <AddressInput
            label="Dirección completa"
            placeholder="Dirección"
            value={address}
            onChange={setAddress}
          />

          <div className="form-group">
            <label className="form-label">Tipo de vivienda</label>
            <RadioGroup
              name="address_type"
              value={addressType}
              onChange={handleAddressTypeChange}
            />
          </div>

          {addressType === 'departamento' && (
            <div ref={departamentoFieldsRef}>
              <FormInput
                type="text"
                label="Piso"
                placeholder="Ej: 3°, PB"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
              />

              <FormInput
                type="text"
                label="Timbre"
                placeholder="Ej: A, 15"
                value={doorbell}
                onChange={(e) => setDoorbell(e.target.value)}
              />
            </div>
          )}
        </div>

        <button type="submit" className="btn-submit">
          Crear cuenta
        </button>

        <p className="register-form-footer">
          ¿Ya tenés cuenta? <span className="register-link" onClick={onSwitchToLogin} style={{ cursor: 'pointer' }}>Iniciar sesión</span>
        </p>
      </form>
    </div>
  )
}

