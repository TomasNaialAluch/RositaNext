'use client'

import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import FormInput from '@/components/forms/FormInput'

interface LoginFormProps {
  onForgotPasswordClick: (e: React.MouseEvent) => void
  onLoginSuccess?: () => void
  isClosing?: boolean
}

export default function LoginForm({ onForgotPasswordClick, onLoginSuccess, isClosing = false }: LoginFormProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Intentar login con email/contraseña
      await signInWithEmailAndPassword(auth, username, password)
      
      // Si el login es exitoso, llamar al callback
      if (onLoginSuccess) {
        onLoginSuccess()
      }
    } catch (err: any) {
      console.error('Error al iniciar sesión:', err)
      setError('Usuario o contraseña incorrectos')
      setLoading(false)
    }
  }

  return (
    <div className={`login-form-container ${isClosing ? 'closing' : ''}`}>
      <form className="login-form" onSubmit={handleSubmit}>
        {error && (
          <div style={{ 
            color: '#BF5065', 
            fontSize: '0.875rem', 
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}
        <FormInput
          type="text"
          label="Usuario o email"
          placeholder="Usuario o email"
          autoFocus
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <FormInput
          type="password"
          label="Contraseña"
          placeholder="Contraseña"
          required
          value={password}
          showPasswordToggle
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
        </button>
        <p className="forgot-password">
          <span className="forgot-link" onClick={onForgotPasswordClick} style={{ cursor: 'pointer' }}>
            ¿Olvidaste tu <span className="forgot-password-bold">contraseña</span>?
          </span>
        </p>
      </form>
    </div>
  )
}

