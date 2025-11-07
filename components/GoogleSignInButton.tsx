'use client'

import { signInWithRedirect, getRedirectResult } from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebase'
import { useState, useEffect } from 'react'

interface GoogleUserData {
  email: string
  displayName: string
  photoURL: string | null
  isNewUser: boolean
}

interface GoogleSignInButtonProps {
  onGoogleSignInSuccess?: (userData: GoogleUserData) => void
}

export default function GoogleSignInButton({ onGoogleSignInSuccess }: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false)

  // Verificar si hay un resultado de redirección al cargar el componente
  useEffect(() => {
    if (!auth) return

    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth)
        if (result) {
          const user = result.user
          
          // Verificar si es un usuario nuevo comparando creationTime con lastSignInTime
          // Si son iguales (o muy cercanos), es un usuario nuevo
          const creationTime = user.metadata.creationTime
          const lastSignInTime = user.metadata.lastSignInTime
          const isNewUser =
            creationTime === lastSignInTime ||
            (!!creationTime &&
              !!lastSignInTime &&
              Math.abs(new Date(creationTime).getTime() - new Date(lastSignInTime).getTime()) < 5000)

          // Extraer datos del usuario de Google
          const userData: GoogleUserData = {
            email: user.email || '',
            displayName: user.displayName || '',
            photoURL: user.photoURL,
            isNewUser
          }

          // Si hay callback, llamarlo con los datos
          if (onGoogleSignInSuccess) {
            onGoogleSignInSuccess(userData)
          } else {
            console.log('Usuario autenticado:', user)
            // Si no hay callback, redirigir o actualizar el estado de la app
          }
        }
      } catch (error: any) {
        // Ignorar errores de redirección si no hay resultado
        if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
          console.error('Error al verificar redirección:', error)
        }
      }
    }

    checkRedirectResult()
  }, [onGoogleSignInSuccess])

  const handleGoogleSignIn = async () => {
    if (!auth) return
    
    setLoading(true)
    try {
      // Usar redirect en lugar de popup para evitar problemas de COOP
      // Esto redirige al usuario a Google y luego vuelve a la app
      await signInWithRedirect(auth, googleProvider)
      // No necesitamos hacer nada más aquí porque el redirect
      // llevará al usuario a Google y luego volverá
      // El resultado se manejará en el useEffect cuando regrese
    } catch (error: any) {
      console.error('Error al iniciar sesión:', error)
      setLoading(false)
      // Aquí puedes mostrar un mensaje de error al usuario
    }
    // No ponemos setLoading(false) aquí porque el redirect
    // navega a otra página, así que el componente se desmonta
  }

  return (
    <button 
      className="btn-google" 
      onClick={handleGoogleSignIn}
      disabled={loading}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" style={{ marginRight: '12px' }}>
        <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
        <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
        <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
        <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
      </svg>
      {loading ? 'Ingresando...' : 'Ingresar con Google'}
    </button>
  )
}

