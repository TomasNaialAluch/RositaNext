'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import TopNavbar from '@/components/shop/TopNavbar'
import BottomNavbar from '@/components/shop/BottomNavbar'
import CartDrawer from '@/components/shop/CartDrawer'
import TiendaContent from '@/components/shop/TiendaContent'
import { useCart } from '@/contexts/CartContext'
import '@/styles/shop.css'

function TiendaContentWrapper() {
  const { cartOpen, openCart, closeCart, cartTotal, showCart, triggerAddToCartAnimation } = useCart()
  const router = useRouter()
  const [stage, setStage] = useState<'logo-falling' | 'logo-positioned' | 'navbar-expanding' | 'complete'>('complete')
  const [isInitialLoad, setIsInitialLoad] = useState(false)
  const [showAddAnimation, setShowAddAnimation] = useState(false)

  useEffect(() => {
    // Verificar si ya se hizo la animación inicial en esta sesión
    const hasAnimated = sessionStorage.getItem('shopNavbarAnimated')
    
    if (hasAnimated) {
      // Si ya se animó, usar animación rápida (aparecer inmediatamente)
      setIsInitialLoad(false)
      setStage('complete')
    } else {
      // Primera vez: animación lenta completa
      setIsInitialLoad(true)
      setStage('logo-falling')
      
      // Etapa 1: Logo bajando desde arriba (2 segundos)
      const timer1 = setTimeout(() => {
        setStage('logo-positioned')
      }, 2000)

      // Etapa 2: Logo en posición, empezar a expandir navbar (0.5 segundos después)
      const timer2 = setTimeout(() => {
        setStage('navbar-expanding')
      }, 2500)

      // Etapa 3: Navbar completamente expandido (1 segundo después)
      const timer3 = setTimeout(() => {
        setStage('complete')
        // Marcar que ya se animó
        sessionStorage.setItem('shopNavbarAnimated', 'true')
      }, 3500)

      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
        clearTimeout(timer3)
      }
    }
  }, [])

  // Escuchar cambios en showCart para la animación
  useEffect(() => {
    if (showCart) {
      setShowAddAnimation(true)
      const timer = setTimeout(() => {
        setShowAddAnimation(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [showCart])

  return (
    <div className="shop-page">
      {/* Barra de navegación superior */}
      <TopNavbar stage={stage} isInitialLoad={isInitialLoad} />

      {/* Contenedor principal */}
      <main className="shop-main-content">
        <TiendaContent />
      </main>

      {/* Barra de navegación inferior */}
      {!cartOpen && (
        <BottomNavbar 
          stage={stage} 
          showCart={showCart} 
          showAddAnimation={showAddAnimation}
          onCartOpen={openCart}
          activeItem="tienda"
          onNavigate={(path) => router.push(path)}
          isInitialLoad={isInitialLoad}
        />
      )}

      {/* Drawer del carrito */}
      <CartDrawer 
        isOpen={cartOpen} 
        onClose={closeCart}
        total={cartTotal}
      />
    </div>
  )
}

export default function TiendaPage() {
  return <TiendaContentWrapper />
}
