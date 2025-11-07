'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { HiX } from 'react-icons/hi'
import '@/styles/tienda.css'

interface ProductModalProps {
  product: {
    id: string
    name: string
    description?: string
    price: number
    image?: string
    unitType?: 'kg' | 'unidad' // Tipo de unidad de venta
    cutOptions?: string[] // Opciones de corte disponibles
    [key: string]: any
  }
  isOpen: boolean
  onClose: () => void
  onAddToCart: (data: {
    productId: string
    quantity: number
    unitType: 'kg' | 'unidad'
    cutOption?: string
  }) => void
}

export default function ProductModal({ product, isOpen, onClose, onAddToCart }: ProductModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [unitType, setUnitType] = useState<'kg' | 'unidad'>(product.unitType || 'kg')
  const [selectedCut, setSelectedCut] = useState<string>('')

  useEffect(() => {
    setQuantity(1)
    setUnitType(product.unitType || 'kg')
    setSelectedCut('')
  }, [product])

  // Opciones de corte disponibles (se pueden personalizar por producto)
  const cutOptions = product.cutOptions || [
    'Milanesa',
    'Picado',
    'En bifes 1 dedo',
    'En bifes 2 dedos',
    'En bifes 3 dedos',
    'Cortado a 3 dedos',
    'Cortado a 4 dedos',
    'Cortado a 5 dedos',
    'Banderita'
  ]

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price)
  }

  const handleAddToCart = () => {
    onAddToCart({
      productId: product.id,
      quantity,
      unitType,
      cutOption: selectedCut || undefined
    })
    onClose()
    // Resetear estado
    setQuantity(1)
    setSelectedCut('')
  }

  if (!isOpen) return null

  return (
    <div className="product-modal-overlay" onClick={onClose}>
      <div
        className="product-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón cerrar (cruz) */}
        <button className="product-modal-close" onClick={onClose} aria-label="Cerrar">
          <HiX className="product-modal-close-icon" />
        </button>

        {/* Contenido del modal */}
        <div className="product-modal-content">
          {/* Imagen */}
          {product.image ? (
            <div className="product-modal-image-container">
              <Image
                src={product.image}
                alt={product.name}
                width={400}
                height={400}
                className="product-modal-image"
                unoptimized
              />
            </div>
          ) : (
            <div className="product-modal-image-placeholder">
              <span>Sin imagen</span>
            </div>
          )}

          {/* Información del producto */}
          <div className="product-modal-info">
            <h2 className="product-modal-title">{product.name}</h2>
            
            {product.description && (
              <p className="product-modal-description">{product.description}</p>
            )}

            <div className="product-modal-price">
              {formatPrice(product.price)} {unitType === 'kg' ? '/ kg' : '/ unidad'}
            </div>

            {/* Selección de cantidad */}
            <div className="product-modal-section">
              <label className="product-modal-label">
                Cantidad ({unitType === 'kg' ? 'kg' : 'unidades'})
              </label>
              <div className="product-modal-quantity">
                <button
                  className="product-modal-quantity-btn"
                  onClick={() => setQuantity(Math.max(0.5, quantity - (unitType === 'kg' ? 0.5 : 1)))}
                >
                  −
                </button>
                <input
                  type="number"
                  className="product-modal-quantity-input"
                  value={quantity}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0
                    setQuantity(Math.max(unitType === 'kg' ? 0.5 : 1, value))
                  }}
                  min={unitType === 'kg' ? 0.5 : 1}
                  step={unitType === 'kg' ? 0.5 : 1}
                />
                <button
                  className="product-modal-quantity-btn"
                  onClick={() => setQuantity(quantity + (unitType === 'kg' ? 0.5 : 1))}
                >
                  +
                </button>
              </div>
            </div>

            {/* Opciones de corte */}
            {cutOptions.length > 0 && (
              <div className="product-modal-section">
                <label className="product-modal-label">¿Cómo lo querés recibir?</label>
                <div className="product-modal-cuts">
                  {cutOptions.map((cut) => (
                    <button
                      key={cut}
                      className={`product-modal-cut-option ${selectedCut === cut ? 'active' : ''}`}
                      onClick={() => setSelectedCut(selectedCut === cut ? '' : cut)}
                    >
                      {cut}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="product-modal-actions">
              <button
                className="product-modal-add-btn"
                onClick={handleAddToCart}
              >
                Agregar al carrito
              </button>
              <button
                className="product-modal-cancel-btn"
                onClick={onClose}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

