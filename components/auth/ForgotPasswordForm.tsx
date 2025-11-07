'use client'

import { useState } from 'react'
import FormInput from '@/components/forms/FormInput'

interface ForgotPasswordFormProps {
  maskedEmail: string
  isClosing?: boolean
}

export default function ForgotPasswordForm({ maskedEmail, isClosing = false }: ForgotPasswordFormProps) {
  const [code, setCode] = useState('')

  return (
    <div className={`forgot-password-container ${isClosing ? 'closing' : ''}`}>
      <div className="forgot-password-message">
        <p className="forgot-password-title">Código enviado</p>
        <p className="forgot-password-text">
          Hemos enviado un código de verificación a:
        </p>
        <p className="forgot-password-email">{maskedEmail}</p>
      </div>
      <form className="forgot-password-form">
        <FormInput
          type="text"
          label="Código de verificación"
          placeholder="Código de 6 dígitos"
          maxLength={6}
          autoFocus
          value={code}
          onChange={(e) => setCode(e.target.value)}
          style={{ textAlign: 'center', letterSpacing: '0.5rem', fontSize: '0.9375rem', fontWeight: '600' }}
        />
        <button type="submit" className="btn-submit">
          Verificar código
        </button>
        <p className="resend-code">
          ¿No recibiste el código? <span className="resend-link">Reenviar código</span>
        </p>
      </form>
    </div>
  )
}

