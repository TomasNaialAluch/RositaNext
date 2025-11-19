'use client'

import { useState, useEffect } from 'react'
import { doc, setDoc, getDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import FormInput from '@/components/forms/FormInput'
import { generateVerificationCode, maskEmail } from '@/utils/email'

interface ForgotPasswordFormProps {
  email: string
  maskedEmail: string
  isClosing?: boolean
  onCodeVerified?: () => void
  onEmailChange?: (email: string) => void
}

export default function ForgotPasswordForm({ email, maskedEmail, isClosing = false, onCodeVerified, onEmailChange }: ForgotPasswordFormProps) {
  const [userEmail, setUserEmail] = useState(email)
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [codeVerified, setCodeVerified] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [passwordReset, setPasswordReset] = useState(false)

  // Actualizar email cuando cambia desde el padre
  useEffect(() => {
    setUserEmail(email)
  }, [email])

  // Enviar código automáticamente solo si hay email y viene del login
  useEffect(() => {
    if (email && email.trim() !== '' && !codeVerified && !emailSent && userEmail === email) {
      sendVerificationCode()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sendVerificationCode = async () => {
    if (!userEmail || userEmail.trim() === '') {
      setError('Por favor, ingresa tu email')
      return
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(userEmail)) {
      setError('Por favor, ingresa un email válido')
      return
    }

    try {
      setLoading(true)
      setError('')
      const verificationCode = generateVerificationCode()
      const codeRef = doc(db, 'passwordResetCodes', userEmail)
      
      // Guardar código en Firestore con expiración de 10 minutos
      await setDoc(codeRef, {
        code: verificationCode,
        email: userEmail,
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutos
        used: false,
        verified: false
      })

      // Intentar enviar código por email usando Cloud Function
      // Si no está configurada, el código se mostrará en consola para desarrollo
      try {
        const { getFunctions, httpsCallable } = await import('firebase/functions')
        const functions = getFunctions()
        const sendCode = httpsCallable(functions, 'sendPasswordResetCode')
        await sendCode({ email: userEmail, code: verificationCode })
        setEmailSent(true)
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } catch (emailError: any) {
        // Si la función no existe o hay error, mostrar código en consola (solo desarrollo)
        console.warn('Cloud Function no configurada o error:', emailError)
        setEmailSent(true)
        // Continuar de todas formas, el código está guardado en Firestore
      }
      
      // Notificar al padre del cambio de email
      if (onEmailChange) {
        onEmailChange(userEmail)
      }

      // NOTA IMPORTANTE: Para producción, necesitas configurar Firebase Functions para enviar el email
      // El código se muestra en consola solo para desarrollo/testing
      // 
      // Para configurar el envío de emails en producción:
      // 1. Crea una Cloud Function que use nodemailer o SendGrid
      // 2. La función debe recibir el email y el código
      // 3. Enviar el email con el código de verificación
      // 
      // Ejemplo de estructura de función:
      // exports.sendPasswordResetCode = functions.https.onCall(async (data, context) => {
      //   const { email, code } = data;
      //   // Enviar email con el código usando nodemailer o SendGrid
      // });
      
      console.log('═══════════════════════════════════════════════════════')
      console.log('🔐 CÓDIGO DE VERIFICACIÓN (SOLO PARA DESARROLLO)')
      console.log('═══════════════════════════════════════════════════════')
      console.log(`Email: ${userEmail}`)
      console.log(`Código: ${verificationCode}`)
      console.log('═══════════════════════════════════════════════════════')
      console.log('⚠️  En producción, este código se enviará por email automáticamente')
      console.log('═══════════════════════════════════════════════════════')
      
    } catch (err: any) {
      console.error('Error al enviar código:', err)
      setError('Error al enviar el código. Por favor, intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userEmail || userEmail.trim() === '') {
      setError('Por favor, ingresa tu email')
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(userEmail)) {
      setError('Por favor, ingresa un email válido')
      return
    }
    await sendVerificationCode()
  }

  const handleResendCode = async () => {
    setIsResending(true)
    setError('')
    await sendVerificationCode()
    setIsResending(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const codeRef = doc(db, 'passwordResetCodes', userEmail)
      const codeDoc = await getDoc(codeRef)

      if (!codeDoc.exists()) {
        setError('Código no encontrado o expirado. Solicita un nuevo código.')
        setLoading(false)
        return
      }

      const codeData = codeDoc.data()
      const expiresAt = codeData.expiresAt?.toDate()
      
      if (expiresAt && expiresAt < new Date()) {
        setError('El código ha expirado. Solicita un nuevo código.')
        await deleteDoc(codeRef)
        setLoading(false)
        return
      }

      if (codeData.used) {
        setError('Este código ya fue utilizado. Solicita un nuevo código.')
        setLoading(false)
        return
      }

      if (codeData.code !== code) {
        setError('Código incorrecto. Intenta nuevamente.')
        setLoading(false)
        return
      }

      // Código verificado correctamente - marcar como verificado pero no usado aún
      await setDoc(codeRef, { verified: true }, { merge: true })
      setCodeVerified(true)
      setSuccess(true)
      if (onCodeVerified) {
        onCodeVerified()
      }
    } catch (err: any) {
      console.error('Error al verificar código:', err)
      setError('Error al verificar el código. Por favor, intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)

    try {
      // Verificar que el código fue verificado y sigue siendo válido
      const codeRef = doc(db, 'passwordResetCodes', userEmail)
      const codeDoc = await getDoc(codeRef)

      if (!codeDoc.exists()) {
        setError('La sesión de verificación ha expirado. Por favor, solicita un nuevo código.')
        setLoading(false)
        return
      }

      const codeData = codeDoc.data()
      if (!codeData.verified) {
        setError('El código no ha sido verificado. Por favor, verifica el código primero.')
        setLoading(false)
        return
      }

      if (codeData.used) {
        setError('Este código ya fue utilizado. Por favor, solicita un nuevo código.')
        setLoading(false)
        return
      }

      // Resetear contraseña usando Cloud Function con Firebase Admin SDK
      try {
        const { getFunctions, httpsCallable } = await import('firebase/functions')
        const functions = getFunctions()
        const resetPassword = httpsCallable(functions, 'resetPassword')
        await resetPassword({ email: userEmail, code, newPassword })
        
        // Marcar como reseteado exitosamente
        setPasswordReset(true)
        setSuccess(true)
        setError('')
        setLoading(false)
        
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          if (onCodeVerified) {
            onCodeVerified()
          }
        }, 3000)
      } catch (resetError: any) {
        // Si la función no existe, mostrar mensaje informativo
        if (resetError.code === 'functions/not-found' || resetError.code === 'functions/unavailable') {
          setError('La función de reset no está configurada. Por favor, contacta al administrador.')
          console.error('Cloud Function resetPassword no configurada')
        } else {
          throw resetError
        }
      }
      
    } catch (err: any) {
      console.error('Error al resetear contraseña:', err)
      
      // Si el error es que el usuario no existe, mostrar mensaje apropiado
      if (err.code === 'auth/user-not-found') {
        setError('No existe una cuenta con este email.')
      } else if (err.code === 'auth/invalid-email') {
        setError('El email no es válido.')
      } else {
        setError('Error al resetear la contraseña. Por favor, intenta nuevamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Si la contraseña fue reseteada exitosamente, mostrar mensaje de éxito
  if (passwordReset) {
    return (
      <div className={`forgot-password-container ${isClosing ? 'closing' : ''}`}>
        <div className="forgot-password-message">
          <div style={{ 
            textAlign: 'center', 
            padding: '2rem 0',
            color: '#4CAF50'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <p className="forgot-password-title" style={{ color: '#4CAF50', marginBottom: '1rem' }}>
              ¡Contraseña actualizada!
            </p>
            <p className="forgot-password-text" style={{ color: '#333', marginBottom: '2rem' }}>
              Tu contraseña ha sido cambiada exitosamente.
              <br />
              Serás redirigido al login en unos segundos...
            </p>
            <button 
              type="button" 
              className="btn-submit" 
              onClick={() => {
                if (onCodeVerified) {
                  onCodeVerified()
                }
              }}
              style={{ marginTop: '1rem' }}
            >
              Ir al login ahora
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Si el código fue verificado, mostrar formulario para nueva contraseña
  if (codeVerified) {
    return (
      <div className={`forgot-password-container ${isClosing ? 'closing' : ''}`}>
        <div className="forgot-password-message">
          <p className="forgot-password-title">Código verificado</p>
          <p className="forgot-password-text">
            Ingresá tu nueva contraseña:
          </p>
        </div>
        <form className="forgot-password-form" onSubmit={handleResetPassword}>
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
            type="password"
            label="Nueva contraseña"
            placeholder="Nueva contraseña"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            showPasswordToggle
          />
          <FormInput
            type="password"
            label="Confirmar contraseña"
            placeholder="Confirmar contraseña"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            showPasswordToggle
          />
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Reseteando...' : 'Resetear contraseña'}
          </button>
        </form>
      </div>
    )
  }

  // Si no hay email o no se ha enviado el código, mostrar formulario para ingresarlo
  if (!userEmail || userEmail.trim() === '' || !emailSent) {
    return (
      <div className={`forgot-password-container ${isClosing ? 'closing' : ''}`}>
        <div className="forgot-password-message">
          <p className="forgot-password-title">Recuperar contraseña</p>
          <p className="forgot-password-text">
            Ingresá tu email para recibir un código de verificación:
          </p>
        </div>
        <form className="forgot-password-form" onSubmit={handleEmailSubmit}>
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
          {success && (
            <div style={{ 
              color: '#4CAF50', 
              fontSize: '0.875rem', 
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              Código enviado correctamente
            </div>
          )}
          <FormInput
            type="email"
            label="Email"
            placeholder="tu@email.com"
            autoFocus
            required
            value={userEmail}
            onChange={(e) => {
              setUserEmail(e.target.value)
              setError('')
            }}
          />
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Enviando código...' : 'Enviar código'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className={`forgot-password-container ${isClosing ? 'closing' : ''}`}>
      <div className="forgot-password-message">
        <p className="forgot-password-title">Código enviado</p>
        <p className="forgot-password-text">
          Hemos enviado un código de verificación a:
        </p>
        <p className="forgot-password-email">{maskEmail(userEmail)}</p>
        {success && (
          <p style={{ color: '#4CAF50', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Código reenviado correctamente
          </p>
        )}
      </div>
      <form className="forgot-password-form" onSubmit={handleVerifyCode}>
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
          label="Código de verificación"
          placeholder="Código de 6 dígitos"
          maxLength={6}
          autoFocus
          required
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          style={{ textAlign: 'center', letterSpacing: '0.5rem', fontSize: '0.9375rem', fontWeight: '600' }}
        />
        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Verificando...' : 'Verificar código'}
        </button>
        <p className="resend-code">
          ¿No recibiste el código?{' '}
          <span 
            className="resend-link" 
            onClick={handleResendCode}
            style={{ cursor: 'pointer', textDecoration: 'underline' }}
          >
            {isResending ? 'Enviando...' : 'Reenviar código'}
          </span>
        </p>
      </form>
    </div>
  )
}

