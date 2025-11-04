'use client'

import Image from 'next/image'
import GoogleSignInButton from '@/components/GoogleSignInButton'
import { useState } from 'react'

export default function Home() {
  const [showLoginForm, setShowLoginForm] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [isClosingForgotPassword, setIsClosingForgotPassword] = useState(false)
  const [showRegisterForm, setShowRegisterForm] = useState(false)
  const [isClosingRegister, setIsClosingRegister] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [addressType, setAddressType] = useState<'casa' | 'departamento'>('casa')

  const handleLoginClick = () => {
    setIsClosing(false)
    setShowLoginForm(true)
  }

  const handleGoBack = () => {
    if (showForgotPassword) {
      // Cerrar formulario de recuperación y volver al login
      setIsClosingForgotPassword(true)
      setTimeout(() => {
        setShowForgotPassword(false)
        setIsClosingForgotPassword(false)
        setIsClosing(false)
      }, 400)
    } else if (showRegisterForm) {
      // Volver a la pantalla inicial desde registro
      setIsClosingRegister(true)
      setTimeout(() => {
        setShowRegisterForm(false)
        setIsClosingRegister(false)
      }, 400)
    } else {
      // Volver a la pantalla inicial desde login
      setIsClosing(true)
      setTimeout(() => {
        setShowLoginForm(false)
        setIsClosing(false)
      }, 400)
    }
  }

  const handleRegisterClick = () => {
    setIsClosingRegister(false)
    setShowRegisterForm(true)
  }

  const handleForgotPasswordClick = (e: React.MouseEvent) => {
    e.preventDefault()
    // Obtener el email del input
    const emailInput = document.querySelector('.form-input[type="text"]') as HTMLInputElement
    const email = emailInput?.value || 'usuario@ejemplo.com'
    setUserEmail(email)
    // Cerrar primero el formulario de login con animación
    setIsClosing(true)
    setTimeout(() => {
      setIsClosing(false)
      setShowForgotPassword(true)
    }, 400)
  }

  const maskEmail = (email: string) => {
    if (!email) return ''
    const [localPart, domain] = email.split('@')
    if (!localPart || !domain) return email
    const visibleStart = localPart.substring(0, 2)
    const maskedMiddle = '*'.repeat(Math.min(localPart.length - 2, 3))
    return `${visibleStart}${maskedMiddle}@${domain}`
  }

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#fff',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Logo con animación */}
      <div className={`logo-container ${(showLoginForm || showRegisterForm) && !isClosing && !isClosingRegister ? 'logo-up' : ''} ${(isClosing || isClosingRegister) ? 'logo-down' : ''}`}>
        <Image 
          src="/images/logo-negro.png" 
          alt="Rosita" 
          width={300} 
          height={300}
          priority
          unoptimized
          className={`logo-image ${(showLoginForm || showRegisterForm) && !isClosing && !isClosingRegister ? 'logo-shrink' : ''} ${(isClosing || isClosingRegister) ? 'logo-grow' : ''}`}
        />
      </div>

      {/* Contenedor de botones */}
      {!showLoginForm && !showRegisterForm && (
        <div className={`auth-container ${isClosing || isClosingRegister ? 'show-buttons' : ''}`}>
          {/* Botón Google */}
          <GoogleSignInButton />

          {/* Botón Iniciar sesión */}
          <button className="btn-login" onClick={handleLoginClick}>
            Iniciar sesión
          </button>

          {/* Texto Regístrate */}
          <p className="register-text">
            ¿No tenés cuenta? <span className="register-link" onClick={handleRegisterClick} style={{ cursor: 'pointer' }}>Regístrate</span>
          </p>
        </div>
      )}

      {/* Formulario de login */}
      {showLoginForm && !showForgotPassword && (
        <>
          <button 
            type="button" 
            className={`btn-back ${isClosing ? 'closing' : ''}`}
            onClick={handleGoBack}
            aria-label="Volver atrás"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="#BF5065" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className={`auth-container show-form ${isClosing ? 'closing' : ''}`}>
            <div className={`login-form-container ${isClosing ? 'closing' : ''}`}>
              <form className="login-form">
              <div className="form-group">
                <label className="form-label">Usuario o email</label>
                <input
                  type="text"
                  placeholder="Usuario o email"
                  className="form-input"
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label">Contraseña</label>
                <input
                  type="password"
                  placeholder="Contraseña"
                  className="form-input"
                />
              </div>
              <button type="submit" className="btn-submit">
                Iniciar sesión
              </button>
              <p className="forgot-password">
                <span className="forgot-link" onClick={handleForgotPasswordClick} style={{ cursor: 'pointer' }}>
                  ¿Olvidaste tu <span className="forgot-password-bold">contraseña</span>?
                </span>
              </p>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Formulario de recuperación de contraseña */}
      {showLoginForm && showForgotPassword && (
        <>
          <button 
            type="button" 
            className={`btn-back ${isClosingForgotPassword ? 'closing' : ''}`}
            onClick={handleGoBack}
            aria-label="Volver atrás"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="#BF5065" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className={`auth-container show-form ${isClosingForgotPassword ? 'closing' : ''}`}>
            <div className={`forgot-password-container ${isClosingForgotPassword ? 'closing' : ''}`}>
              <div className="forgot-password-message">
                <p className="forgot-password-title">Código enviado</p>
                <p className="forgot-password-text">
                  Hemos enviado un código de verificación a:
                </p>
                <p className="forgot-password-email">{maskEmail(userEmail)}</p>
              </div>
              <form className="forgot-password-form">
                <div className="form-group">
                  <label className="form-label">Código de verificación</label>
                  <input
                    type="text"
                    placeholder="Código de 6 dígitos"
                    className="form-input"
                    maxLength={6}
                    autoFocus
                    style={{ textAlign: 'center', letterSpacing: '0.5rem', fontSize: '0.9375rem', fontWeight: '600' }}
                  />
                </div>
                <button type="submit" className="btn-submit">
                  Verificar código
                </button>
                <p className="resend-code">
                  ¿No recibiste el código? <span className="resend-link">Reenviar código</span>
                </p>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Formulario de registro */}
      {showRegisterForm && (
        <>
          <button 
            type="button" 
            className={`btn-back ${isClosingRegister ? 'closing' : ''}`}
            onClick={handleGoBack}
            aria-label="Volver atrás"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="#BF5065" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className={`auth-container show-form register-form ${isClosingRegister ? 'closing' : ''}`}>
            <div className={`register-form-container ${isClosingRegister ? 'closing' : ''}`}>
              <form className="register-form-content">
                {/* Sección 1: Información básica */}
                <div className="form-section">
                  <h3 className="form-section-title">Información básica</h3>
                  
                  <div className="form-group">
                    <label className="form-label">Nombre completo *</label>
                    <input
                      type="text"
                      placeholder="Nombre completo"
                      className="form-input"
                      required
                      autoFocus
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      placeholder="Email"
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Teléfono</label>
                    <input
                      type="tel"
                      placeholder="Teléfono (opcional)"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Contraseña *</label>
                    <input
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      className="form-input"
                      required
                      minLength={6}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Confirmar contraseña *</label>
                    <input
                      type="password"
                      placeholder="Confirmar contraseña"
                      className="form-input"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                {/* Sección 2: Dirección de entrega */}
                <div className="form-section">
                  <h3 className="form-section-title">Dirección de entrega (opcional)</h3>
                  
                  <div className="form-group">
                    <label className="form-label">Dirección completa</label>
                    <input
                      type="text"
                      placeholder="Dirección"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tipo de vivienda</label>
                    <div className="radio-group">
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="address_type"
                          value="casa"
                          checked={addressType === 'casa'}
                          onChange={(e) => setAddressType(e.target.value as 'casa' | 'departamento')}
                          className="radio-input"
                        />
                        <span>Casa</span>
                      </label>
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="address_type"
                          value="departamento"
                          checked={addressType === 'departamento'}
                          onChange={(e) => setAddressType(e.target.value as 'casa' | 'departamento')}
                          className="radio-input"
                        />
                        <span>Departamento</span>
                      </label>
                    </div>
                  </div>

                  {addressType === 'departamento' && (
                    <>
                      <div className="form-group">
                        <label className="form-label">Piso</label>
                        <input
                          type="text"
                          placeholder="Ej: 3°, PB"
                          className="form-input"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Timbre</label>
                        <input
                          type="text"
                          placeholder="Ej: A, 15"
                          className="form-input"
                        />
                      </div>
                    </>
                  )}
                </div>

                <button type="submit" className="btn-submit">
                  Crear cuenta
                </button>

                <p className="register-form-footer">
                  ¿Ya tenés cuenta? <span className="register-link" onClick={() => {
                    setIsClosingRegister(true)
                    setTimeout(() => {
                      setShowRegisterForm(false)
                      setIsClosingRegister(false)
                      setShowLoginForm(true)
                    }, 400)
                  }} style={{ cursor: 'pointer' }}>Iniciar sesión</span>
                </p>
              </form>
            </div>
          </div>
        </>
      )}
    </main>
  )
}
