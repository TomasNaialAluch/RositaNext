'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut, onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import TopNavbar from '@/components/shop/TopNavbar'
import BottomNavbar from '@/components/shop/BottomNavbar'
import '@/styles/shop.css'
import '@/styles/perfil.css'

export default function PerfilPage() {
  const router = useRouter()
  const [stage, setStage] = useState<'logo-falling' | 'logo-positioned' | 'navbar-expanding' | 'complete'>('complete')
  const [isInitialLoad, setIsInitialLoad] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    // Si ya se animó en otra página, usar animación rápida (aparecer inmediatamente)
    const hasAnimated = sessionStorage.getItem('shopNavbarAnimated')
    
    if (hasAnimated) {
      setIsInitialLoad(false)
      setStage('complete')
    } else {
      // Si es la primera vez, hacer animación inicial
      setIsInitialLoad(true)
      setStage('logo-falling')
      
      const timer1 = setTimeout(() => {
        setStage('logo-positioned')
      }, 1000)

      const timer2 = setTimeout(() => {
        setStage('navbar-expanding')
      }, 1500)

      const timer3 = setTimeout(() => {
        setStage('complete')
        sessionStorage.setItem('shopNavbarAnimated', 'true')
      }, 2500)

      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
        clearTimeout(timer3)
      }
    }
  }, [])

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }

    // Escuchar cambios en el estado de autenticación
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser)
      } else {
        // Si no hay usuario, redirigir a auth
        router.push('/')
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  const handleNavigate = (path: string) => {
    router.push(path)
  }

  const handleSignOut = async () => {
    if (!auth) return
    
    try {
      setSigningOut(true)
      await signOut(auth)
      // Limpiar sessionStorage para que la próxima vez haga la animación completa
      sessionStorage.removeItem('shopNavbarAnimated')
      // Redirigir a la página de auth
      router.push('/')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      setSigningOut(false)
    }
  }

  if (loading) {
    return (
      <div className="shop-page">
        <div className="perfil-loading">
          <p>Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="shop-page">
      {/* Barra de navegación superior */}
      <TopNavbar stage={stage} isInitialLoad={isInitialLoad} />

      {/* Contenedor principal */}
      <main className="shop-main-content">
        <div className="perfil-content-container">
          {/* Información del usuario */}
          <div className="perfil-header">
            {user?.photoURL ? (
              <div className="perfil-avatar">
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || 'Usuario'} 
                  className="perfil-avatar-image"
                />
              </div>
            ) : (
              <div className="perfil-avatar-placeholder">
                <span className="perfil-avatar-initial">
                  {user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            )}
            
            <h1 className="perfil-name">
              {user?.displayName || 'Usuario'}
            </h1>
            
            {user?.email && (
              <p className="perfil-email">{user.email}</p>
            )}
          </div>

          {/* Sección de información adicional */}
          <div className="perfil-info-section">
            <h2 className="perfil-section-title">Información de la cuenta</h2>
            
            <div className="perfil-info-item">
              <span className="perfil-info-label">Email:</span>
              <span className="perfil-info-value">{user?.email || 'No disponible'}</span>
            </div>
            
            {user?.displayName && (
              <div className="perfil-info-item">
                <span className="perfil-info-label">Nombre:</span>
                <span className="perfil-info-value">{user.displayName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Botón de cerrar sesión */}
        <div className="perfil-signout-container">
          <button 
            className="perfil-signout-button"
            onClick={handleSignOut}
            disabled={signingOut}
          >
            {signingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
          </button>
        </div>
      </main>

      {/* Barra de navegación inferior */}
      <BottomNavbar 
        stage={stage} 
        activeItem="perfil"
        onNavigate={handleNavigate}
        isInitialLoad={isInitialLoad}
      />
    </div>
  )
}

