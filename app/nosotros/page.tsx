'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import TopNavbar from '@/components/shop/TopNavbar'
import BottomNavbar from '@/components/shop/BottomNavbar'
import '@/styles/shop.css'
import '@/styles/nosotros.css'

export default function NosotrosPage() {
  const router = useRouter()
  const [stage, setStage] = useState<'logo-falling' | 'logo-positioned' | 'navbar-expanding' | 'complete'>('complete')
  const [isInitialLoad, setIsInitialLoad] = useState(false)

  useEffect(() => {
    // Si ya se animó en otra página, usar animación rápida (aparecer inmediatamente)
    const hasAnimated = sessionStorage.getItem('shopNavbarAnimated')
    
    if (hasAnimated) {
      setIsInitialLoad(false)
      // Aparecer inmediatamente sin animación
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

  const handleNavigate = (path: string) => {
    router.push(path)
  }

  return (
    <div className="shop-page">
      {/* Barra de navegación superior */}
      <TopNavbar stage={stage} isInitialLoad={isInitialLoad} />

      {/* Contenedor principal */}
      <main className="shop-main-content">
        <div className="nosotros-content-container">
          {/* Logo principal */}
          <div className="nosotros-logo-container">
            <Image 
              src="/images/logo-main.png" 
              alt="Rosita Carnicería Premium" 
              width={300} 
              height={200}
              priority
              unoptimized
              className="nosotros-logo-main"
            />
          </div>

          {/* Foto de la abuela */}
          <div className="nosotros-abuela-container">
            <Image 
              src="/images/abuela-rosita-nueva.png" 
              alt="Abuela Rosita" 
              width={400} 
              height={500}
              priority
              unoptimized
              className="nosotros-abuela-image"
            />
          </div>

          {/* Contenido de la historia */}
          <div className="nosotros-history-container">
            <h2 className="nosotros-subtitle">
              Tradición familiar, calidad generación tras generación.
            </h2>
            
            <div className="nosotros-text-content">
              <p className="nosotros-paragraph">
                Desde hace 4 generaciones, nuestra familia ha dedicado su vida a la carne. Hoy, con la misma pasión de siempre, llevamos la tradición de Rosita al mundo digital. Nuestra abuela Rosita, con sus 92 años, sigue siendo nuestra inspiración y guía. Su legado de calidad y sabor auténtico se mantiene vivo en cada corte que seleccionamos.
              </p>
              
              <p className="nosotros-paragraph">
                En Nuestra Tienda Online Rosita, creemos que la carne es más que un alimento: es una experiencia. Por eso, seleccionamos solo los mejores cortes, directamente del mayorista, y los llevamos a tu puerta con la misma frescura que si los hubieras elegido tú mismo en la carnicería. Nuestra abuela Rosita nos enseñó que la calidad no tiene precio, y ese es el compromiso que asumimos con cada cliente.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Barra de navegación inferior */}
      <BottomNavbar 
        stage={stage} 
        activeItem="nosotros"
        onNavigate={handleNavigate}
        isInitialLoad={isInitialLoad}
      />
    </div>
  )
}

