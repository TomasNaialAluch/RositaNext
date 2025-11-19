'use client'

import { useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { auth, db } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

interface AdminAuthGuardProps {
  children: ReactNode
  onAuthSuccess: (email: string | null) => void
}

export default function AdminAuthGuard({ children, onAuthSuccess }: AdminAuthGuardProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/')
        return
      }

      try {
        // Verificar rol del usuario en Firestore
        const userDocRef = doc(db, 'users', user.uid)
        const userDoc = await getDoc(userDocRef)
        
        if (userDoc.exists()) {
          const userData = userDoc.data()
          const role = userData.role || 'user'
          
          if (role === 'admin') {
            setIsAdmin(true)
            onAuthSuccess(user.email)
          } else {
            // No es admin, redirigir
            router.push('/')
          }
        } else {
          // Usuario no existe en Firestore, no es admin
          router.push('/')
        }
      } catch (error) {
        console.error('Error verificando rol:', error)
        router.push('/')
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [router, onAuthSuccess])

  if (loading) {
    return (
      <div className="admin-loading">
        <p>Verificando permisos...</p>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return <>{children}</>
}









