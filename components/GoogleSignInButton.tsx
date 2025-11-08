'use client'

import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider, db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { useState } from 'react'

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

  const handleGoogleSignIn = async () => {
    if (!auth || !db) return
    
    setLoading(true)
    try {
      // Usar popup en lugar de redirect para mantener el estado
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user
      
      // Verificar si el usuario existe en Firestore
      const userDocRef = doc(db, 'users', user.uid)
      const userDoc = await getDoc(userDocRef)
      const existsInFirestore = userDoc.exists()

      // Extraer datos del usuario de Google
      const userData: GoogleUserData = {
        email: user.email || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL,
        isNewUser: !existsInFirestore // Si no existe en Firestore, es nuevo
      }

      // Llamar al callback con los datos
      if (onGoogleSignInSuccess) {
        onGoogleSignInSuccess(userData)
      }
    } catch (error: any) {
      console.error('Error al iniciar sesión:', error)
      // Si el usuario cierra el popup, no es un error crítico
      if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
        alert('Error al iniciar sesión con Google. Por favor, intenta de nuevo.')
      }
    } finally {
      setLoading(false)
    }
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

