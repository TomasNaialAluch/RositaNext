'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AuthLogo from '@/components/auth/AuthLogo'
import AuthButtons from '@/components/auth/AuthButtons'
import BackButton from '@/components/auth/BackButton'
import LoginForm from '@/components/auth/LoginForm'
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'
import RegisterForm from '@/components/auth/RegisterForm'
import RegisterSuccessAnimation from '@/components/auth/RegisterSuccessAnimation'
import LoginFormSuccessAnimation from '@/components/auth/LoginFormSuccessAnimation'
import LoginSuccessAnimation from '@/components/auth/LoginSuccessAnimation'
import { maskEmail } from '@/utils/email'
import '@/styles/auth.css'

interface GoogleUserData {
  email: string
  displayName: string
  photoURL: string | null
  isNewUser: boolean
}

export default function Home() {
  const router = useRouter()
  const [showLoginForm, setShowLoginForm] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [isClosingForgotPassword, setIsClosingForgotPassword] = useState(false)
  const [showRegisterForm, setShowRegisterForm] = useState(false)
  const [isClosingRegister, setIsClosingRegister] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [googleUserData, setGoogleUserData] = useState<GoogleUserData | null>(null)
  const [showLoginSuccess, setShowLoginSuccess] = useState(false)
  const [showLoginFormSuccess, setShowLoginFormSuccess] = useState(false)
  const [showRegisterSuccess, setShowRegisterSuccess] = useState(false)

  const handleGoogleSignInSuccess = (userData: GoogleUserData) => {
    if (userData.isNewUser) {
      // Si es un usuario nuevo, mostrar el formulario de registro con datos prellenados
      setGoogleUserData(userData)
      setIsClosingRegister(false)
      setShowRegisterForm(true)
    } else {
      // Si es un usuario existente, mostrar animación de login exitoso
      setShowLoginSuccess(true)
    }
  }

  const handleLoginClick = () => {
    setIsClosing(false)
    setShowLoginForm(true)
  }

  const handleGoBack = () => {
    if (showForgotPassword) {
      setIsClosingForgotPassword(true)
      setTimeout(() => {
        setShowForgotPassword(false)
        setIsClosingForgotPassword(false)
        setIsClosing(false)
      }, 400)
    } else if (showRegisterForm) {
      setIsClosingRegister(true)
      setTimeout(() => {
        setShowRegisterForm(false)
        setIsClosingRegister(false)
      }, 400)
    } else {
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
    const emailInput = document.querySelector('.form-input[type="text"]') as HTMLInputElement
    const email = emailInput?.value || 'usuario@ejemplo.com'
    setUserEmail(email)
    setIsClosing(true)
    setTimeout(() => {
      setIsClosing(false)
      setShowForgotPassword(true)
    }, 400)
  }

  const handleSwitchToLogin = () => {
    setIsClosingRegister(true)
    setTimeout(() => {
      setShowRegisterForm(false)
      setIsClosingRegister(false)
      setShowLoginForm(true)
      setGoogleUserData(null) // Limpiar datos de Google al cambiar de vista
    }, 400)
  }

  const handleRegisterSuccess = () => {
    setShowRegisterSuccess(true)
  }

  const handleRegisterSuccessComplete = () => {
    setShowRegisterSuccess(false)
    router.push('/firstanimation')
  }

  const handleLoginFormSuccess = () => {
    setShowLoginFormSuccess(true)
  }

  const handleLoginFormSuccessComplete = () => {
    setShowLoginFormSuccess(false)
    router.push('/firstanimation')
  }

  const handleLoginSuccessComplete = () => {
    setShowLoginSuccess(false)
    router.push('/firstanimation')
  }

  // Determinar qué vista mostrar
  const isFormVisible = showLoginForm || showRegisterForm
  const isClosingAny = isClosing || isClosingRegister || isClosingForgotPassword

  return (
    <main className="auth-main-container">
      {/* Animación de login exitoso con Google */}
      {showLoginSuccess && (
        <LoginSuccessAnimation onComplete={handleLoginSuccessComplete} />
      )}

      {/* Animación de login exitoso con usuario/contraseña */}
      {showLoginFormSuccess && (
        <LoginFormSuccessAnimation onComplete={handleLoginFormSuccessComplete} />
      )}

      {/* Animación de registro exitoso */}
      {showRegisterSuccess && (
        <RegisterSuccessAnimation onComplete={handleRegisterSuccessComplete} />
      )}

      {!showLoginSuccess && !showLoginFormSuccess && !showRegisterSuccess && (
        <div className={`auth-content-wrapper ${isFormVisible ? 'form-visible' : ''}`}>
        {/* Logo - siempre visible */}
        <AuthLogo isShrunk={isFormVisible && !isClosingAny} />

        {/* Botones iniciales */}
        {!showLoginForm && !showRegisterForm && (
          <AuthButtons
            onLoginClick={handleLoginClick}
            onRegisterClick={handleRegisterClick}
            onGoogleSignInSuccess={handleGoogleSignInSuccess}
            isClosing={isClosingAny}
          />
        )}

        {/* Botón volver - solo cuando hay formulario */}
        {isFormVisible && (
          <BackButton 
            onClick={handleGoBack} 
            isClosing={isClosingAny}
            isStatic
          />
        )}

        {/* Formulario de login */}
        {showLoginForm && !showForgotPassword && (
          <div className={`auth-container auth-container-login ${isClosing ? 'closing' : ''}`}>
            <LoginForm 
              onForgotPasswordClick={handleForgotPasswordClick} 
              onLoginSuccess={handleLoginFormSuccess}
              isClosing={isClosing} 
            />
          </div>
        )}

        {/* Formulario de recuperación de contraseña */}
        {showLoginForm && showForgotPassword && (
          <div className={`auth-container ${isClosingForgotPassword ? 'closing' : ''}`}>
            <ForgotPasswordForm
              maskedEmail={maskEmail(userEmail)}
              isClosing={isClosingForgotPassword}
            />
          </div>
        )}

        {/* Formulario de registro */}
        {showRegisterForm && (
          <div className={`auth-container register-form-container ${isClosingRegister ? 'closing' : ''}`}>
            <RegisterForm
              onSwitchToLogin={handleSwitchToLogin}
              onRegisterSuccess={handleRegisterSuccess}
              isClosing={isClosingRegister}
              initialData={googleUserData}
            />
          </div>
        )}
      </div>
      )}
    </main>
  )
}
