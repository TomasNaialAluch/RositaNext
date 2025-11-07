'use client'

import GoogleSignInButton from '@/components/GoogleSignInButton'

interface GoogleUserData {
  email: string
  displayName: string
  photoURL: string | null
  isNewUser: boolean
}

interface AuthButtonsProps {
  onLoginClick: () => void
  onRegisterClick: () => void
  onGoogleSignInSuccess?: (userData: GoogleUserData) => void
  isClosing?: boolean
}

export default function AuthButtons({ onLoginClick, onRegisterClick, onGoogleSignInSuccess, isClosing = false }: AuthButtonsProps) {
  return (
    <div className={`auth-container ${isClosing ? 'show-buttons' : ''}`}>
      <GoogleSignInButton onGoogleSignInSuccess={onGoogleSignInSuccess} />
      <button className="btn-login" onClick={onLoginClick}>
        Iniciar sesión
      </button>
      <p className="register-text">
        ¿No tenés cuenta? <span className="register-link" onClick={onRegisterClick} style={{ cursor: 'pointer' }}>Regístrate</span>
      </p>
    </div>
  )
}

