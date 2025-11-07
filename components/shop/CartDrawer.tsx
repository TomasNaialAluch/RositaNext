'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { HiShoppingBag } from 'react-icons/hi2'
import Image from 'next/image'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
  total: number
}

export default function CartDrawer({ isOpen, onClose, total }: CartDrawerProps) {
  const router = useRouter()
  const [isAnimating, setIsAnimating] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartY, setDragStartY] = useState(0)
  const [dragCurrentY, setDragCurrentY] = useState(0)
  const [hasDragged, setHasDragged] = useState(false)
  const circleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true)
    } else {
      setIsAnimating(false)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!isOpen) return
      const currentY = e.clientY
      setDragCurrentY(currentY)
      setHasDragged(true)
      
      // Si el usuario arrastra hacia abajo más de 50px, cerrar el carrito
      if (currentY - dragStartY > 50) {
        onClose()
        setIsDragging(false)
        setHasDragged(false)
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      setDragStartY(0)
      setDragCurrentY(0)
      setTimeout(() => setHasDragged(false), 100)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, isOpen, dragStartY, onClose])

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isOpen) return
    e.stopPropagation()
    setIsDragging(true)
    setHasDragged(false)
    setDragStartY(e.touches[0].clientY)
    setDragCurrentY(e.touches[0].clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !isOpen) return
    e.stopPropagation()
    const currentY = e.touches[0].clientY
    setDragCurrentY(currentY)
    setHasDragged(true)
    
    // Si el usuario arrastra hacia abajo más de 50px, cerrar el carrito
    if (currentY - dragStartY > 50) {
      onClose()
      setIsDragging(false)
      setHasDragged(false)
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    setDragStartY(0)
    setDragCurrentY(0)
    setTimeout(() => setHasDragged(false), 100)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isOpen) return
    e.stopPropagation()
    setIsDragging(true)
    setHasDragged(false)
    setDragStartY(e.clientY)
    setDragCurrentY(e.clientY)
  }

  const handleClick = (e: React.MouseEvent) => {
    if (isOpen && !hasDragged) {
      e.stopPropagation()
      onClose()
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price)
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className={`cart-overlay ${isAnimating ? 'visible' : ''}`}
          onClick={onClose}
        />
      )}

      {/* Drawer Container */}
      <div className={`cart-drawer-container ${isOpen ? 'open' : ''}`}>
        {/* Barra superior con el círculo que sube */}
        <div className={`cart-drawer-top-bar ${isOpen ? 'expanded' : ''}`}>
          <div 
            ref={circleRef}
            className={`cart-drawer-logo-circle ${isOpen ? 'at-top' : 'at-bottom'} ${isDragging ? 'dragging' : ''}`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onClick={handleClick}
            style={{
              cursor: isOpen ? 'pointer' : 'default',
              transform: isDragging && isOpen
                ? `translate(-50%, ${-50 + (dragCurrentY - dragStartY)}%)`
                : isOpen
                ? 'translate(-50%, -50%)'
                : 'translate(-50%, 50%)',
              transition: isDragging ? 'none' : 'top 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94), bottom 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.4s ease-out'
            }}
          >
            {isOpen ? (
              <HiShoppingBag className="cart-drawer-cart-icon" />
            ) : (
              <Image 
                src="/images/logo-simple.png" 
                alt="Rosita" 
                width={40} 
                height={40}
                priority
                unoptimized
                className="cart-drawer-logo"
              />
            )}
          </div>
        </div>

        {/* Contenedor del contenido del carrito */}
        <div className={`cart-drawer-content ${isOpen ? 'visible' : ''}`}>
          <div className="cart-drawer-header">
            <h2 className="cart-drawer-title">Carrito</h2>
            <button 
              className="cart-drawer-close-btn"
              onClick={onClose}
              aria-label="Cerrar carrito"
            >
              ✕
            </button>
          </div>

          <div className="cart-drawer-items">
            {/* Aquí irán los items del carrito */}
            <div className="cart-empty-message">
              <p>Tu carrito está vacío</p>
            </div>
          </div>
        </div>

        {/* Barra inferior fija con total y botón checkout */}
        <div className={`cart-drawer-footer ${isOpen ? 'visible' : ''}`}>
          <div className="cart-footer-content">
            <div className="cart-footer-total">
              <span className="cart-footer-total-label">Total:</span>
              <span className="cart-footer-total-amount">{formatPrice(total)}</span>
            </div>
            <button 
              className="cart-footer-checkout-btn"
              onClick={() => {
                onClose()
                router.push('/checkout')
              }}
            >
              Ir a checkout
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

