'use client'

import { useEffect } from 'react'
import { HiXMark } from 'react-icons/hi2'

interface RositaModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  showCloseButton?: boolean
  size?: 'small' | 'medium' | 'large'
}

export default function RositaModal({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true,
  size = 'medium'
}: RositaModalProps) {
  // Cerrar con ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevenir scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="rosita-modal-overlay" onClick={onClose}>
      <div 
        className={`rosita-modal-content rosita-modal-${size}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con gradiente Rosita */}
        {(title || showCloseButton) && (
          <div className="rosita-modal-header">
            {title && (
              <h2 className="rosita-modal-title">{title}</h2>
            )}
            {showCloseButton && (
              <button
                className="rosita-modal-close"
                onClick={onClose}
                aria-label="Cerrar modal"
              >
                <HiXMark />
              </button>
            )}
          </div>
        )}

        {/* Contenido */}
        <div className="rosita-modal-body">
          {children}
        </div>
      </div>
    </div>
  )
}

