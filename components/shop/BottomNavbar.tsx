'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { HiShoppingBag, HiBookOpen, HiUserGroup, HiClipboardDocumentList, HiUser, HiShoppingCart, HiPlus } from 'react-icons/hi2'

interface BottomNavbarProps {
  stage: 'logo-falling' | 'logo-positioned' | 'navbar-expanding' | 'complete'
  showCart?: boolean
  showAddAnimation?: boolean
  onCartOpen?: () => void
  activeItem?: 'tienda' | 'recetas' | 'nosotros' | 'pedidos' | 'perfil'
  onNavigate?: (path: string) => void
  isInitialLoad?: boolean
}

export default function BottomNavbar({ stage, showCart = false, showAddAnimation = false, onCartOpen, activeItem, onNavigate, isInitialLoad = false }: BottomNavbarProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartY, setDragStartY] = useState(0)
  const [dragCurrentY, setDragCurrentY] = useState(0)
  const logoRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    if (stage !== 'complete' || !onCartOpen) return
    setIsDragging(true)
    setDragStartY(e.touches[0].clientY)
    setDragCurrentY(e.touches[0].clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !onCartOpen) return
    const currentY = e.touches[0].clientY
    setDragCurrentY(currentY)
    
    // Si el usuario arrastra hacia arriba más de 50px, abrir el carrito
    if (dragStartY - currentY > 50 && onCartOpen) {
      onCartOpen()
      setIsDragging(false)
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    setDragStartY(0)
    setDragCurrentY(0)
  }

  const handleClick = () => {
    if (stage === 'complete' && onCartOpen) {
      onCartOpen()
    }
  }

  return (
    <nav className={`bottom-navbar ${stage} ${isInitialLoad ? 'initial-load' : 'quick-transition'}`}>
      <div className="bottom-navbar-content">
        {/* Botones de navegación */}
        <div className="bottom-navbar-nav-items">
          {activeItem === 'nosotros' || activeItem === 'recetas' || activeItem === 'pedidos' || activeItem === 'perfil' ? (
            <button 
              className="bottom-navbar-nav-item"
              onClick={() => onNavigate?.('/tienda')}
            >
              <HiShoppingCart className="bottom-navbar-nav-icon" />
              <span className="bottom-navbar-nav-text">Tienda</span>
            </button>
          ) : (
            <button 
              className="bottom-navbar-nav-item"
              onClick={() => onNavigate?.('/recetas')}
            >
              <HiBookOpen className="bottom-navbar-nav-icon" />
              <span className="bottom-navbar-nav-text">Recetas</span>
            </button>
          )}
          <button 
            className={`bottom-navbar-nav-item ${activeItem === 'nosotros' ? 'active' : ''}`}
            onClick={() => onNavigate?.('/nosotros')}
          >
            <HiUserGroup className="bottom-navbar-nav-icon" />
            <span className="bottom-navbar-nav-text">Nosotros</span>
          </button>
        </div>

        {/* Círculo central con logo/carrito */}
        <div 
          ref={logoRef}
          className={`bottom-navbar-logo-container ${isDragging ? 'dragging' : ''} ${showAddAnimation ? 'add-animation' : ''}`}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={handleClick}
          style={{
            cursor: stage === 'complete' && onCartOpen ? 'pointer' : 'default',
            transform: isDragging 
              ? `translate(-50%, ${-50 + (dragStartY - dragCurrentY)}%)` 
              : 'translate(-50%, -50%)',
            transition: isDragging ? 'none' : 'transform 0.3s ease-out'
          }}
        >
          <div className="bottom-navbar-logo-wrapper">
            {showCart && onCartOpen ? (
              <>
                <HiShoppingBag className="bottom-navbar-cart-icon" />
                {showAddAnimation && (
                  <div className="bottom-navbar-add-indicator">
                    <HiPlus className="bottom-navbar-add-icon" />
                  </div>
                )}
              </>
            ) : (
              <Image 
                src="/images/logo-simple.png" 
                alt="Rosita" 
                width={40} 
                height={40}
                priority
                unoptimized
                className="bottom-navbar-logo"
              />
            )}
          </div>
        </div>

        {/* Botones de navegación derecha */}
        <div className="bottom-navbar-nav-items">
          <button 
            className={`bottom-navbar-nav-item ${activeItem === 'pedidos' ? 'active' : ''}`}
            onClick={() => onNavigate?.('/pedidos')}
          >
            <HiClipboardDocumentList className="bottom-navbar-nav-icon" />
            <span className="bottom-navbar-nav-text">Mis Pedidos</span>
          </button>
          <button 
            className={`bottom-navbar-nav-item ${activeItem === 'perfil' ? 'active' : ''}`}
            onClick={() => onNavigate?.('/perfil')}
          >
            <HiUser className="bottom-navbar-nav-icon" />
            <span className="bottom-navbar-nav-text">Perfil</span>
          </button>
        </div>
      </div>
    </nav>
  )
}

