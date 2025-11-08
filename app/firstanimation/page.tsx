'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import TopNavbar from '@/components/shop/TopNavbar'
import BottomNavbar from '@/components/shop/BottomNavbar'
import '@/styles/shop.css'
import '@/styles/firstanimation.css'

export default function FirstAnimationPage() {
  const router = useRouter()
  const [stage, setStage] = useState<'logo-falling' | 'logo-positioned' | 'navbar-expanding' | 'complete'>('logo-falling')
  // El stage empieza en 'logo-falling' pero no se usa hasta que showLogo sea true
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [showWelcome, setShowWelcome] = useState(false)
  const [showWelcomeText, setShowWelcomeText] = useState(false)
  const [showLogo, setShowLogo] = useState(false)

  useEffect(() => {
    // Estado inicial: 1 segundo de pantalla blanca sin nada
    // Después de 1 segundo, mostrar el logo arriba y empezar la animación
    
    // Esperar 1 segundo antes de mostrar el logo para que todo esté cargado
    const logoDelayTimer = setTimeout(() => {
      setShowLogo(true)
      // Inmediatamente después de mostrar el logo, empezar la animación de caída
      setStage('logo-falling')
    }, 1000)

    // Etapa 1: Logo bajando desde arriba (3 segundos después de aparecer) - más lento
    const timer1 = setTimeout(() => {
      setStage('logo-positioned')
    }, 4000) // 1 segundo de delay + 3 segundos de caída

    // Etapa 2: Logo en posición, empezar a expandir navbar (1 segundo después)
    const timer2 = setTimeout(() => {
      setStage('navbar-expanding')
    }, 5000)

    // Etapa 3: Navbar completamente expandido (1 segundo después)
    const timer3 = setTimeout(() => {
      setStage('complete')
    }, 6000)

    // Mostrar texto de bienvenida después de 1 segundo (fade-in suave)
    const textTimer = setTimeout(() => {
      setShowWelcome(true)
      setTimeout(() => {
        setShowWelcomeText(true)
      }, 200)
    }, 1000)

    // Después de 7 segundos totales (1 segundo delay + 6 segundos animación), redirigir a tienda
    const redirectTimer = setTimeout(() => {
      // Marcar que ya se animó para que la tienda use animación rápida
      sessionStorage.setItem('shopNavbarAnimated', 'true')
      router.push('/tienda')
    }, 7000)

    return () => {
      clearTimeout(logoDelayTimer)
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(textTimer)
      clearTimeout(redirectTimer)
    }
  }, [router])

  return (
    <div className="first-animation-page">
      {/* Logo grande que cae desde arriba */}
      {showLogo && (
        <div className={`first-animation-falling-logo ${stage === 'logo-falling' ? 'falling' : stage === 'logo-positioned' ? 'positioned' : 'hidden'}`}>
          <Image 
            src="/images/logo-simple.png" 
            alt="Rosita" 
            width={80} 
            height={80}
            priority
            unoptimized
            className="first-animation-logo-image"
          />
        </div>
      )}

      {/* Barra de navegación superior */}
      <TopNavbar stage={stage} isInitialLoad={isInitialLoad} />

      {/* Contenido principal - Pantalla blanca con mensaje de bienvenida */}
      <main className="first-animation-content">
        {showWelcome && (
          <div className={`first-animation-welcome ${showWelcomeText ? 'visible' : ''}`}>
            <h1 className="first-animation-title">Bienvenido a Rosita</h1>
            <p className="first-animation-subtitle">Tu carnicería de confianza</p>
          </div>
        )}
      </main>

      {/* Barra de navegación inferior */}
      <BottomNavbar 
        stage={stage} 
        isInitialLoad={isInitialLoad}
        activeItem="tienda"
      />
    </div>
  )
}

