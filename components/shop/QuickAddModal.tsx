'use client'

import { useEffect, useState } from 'react'
import { HiX } from 'react-icons/hi'
import '@/styles/tienda.css'

interface QuickAddModalProps {
  product: {
    id: string
    name: string
    price: number
    unitType?: 'kg' | 'unidad'
    cutOptions?: string[]
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

export default function QuickAddModal({ product, isOpen, onClose, onAddToCart }: QuickAddModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [unitType, setUnitType] = useState<'kg' | 'unidad'>(product.unitType || 'kg')
  const [selectedCut, setSelectedCut] = useState<string>('')

  useEffect(() => {
    const initialUnitType = product.unitType || 'kg'
    const initialQuantity =
      initialUnitType === 'kg'
        ? product.minQuantity && product.minQuantity > 0
          ? product.minQuantity
          : 1
        : 1

    setQuantity(initialQuantity)
    setUnitType(initialUnitType)
    setSelectedCut('')
  }, [product])

  // Opciones de corte disponibles
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

  const isKg = unitType === 'kg'
  const minQuantity =
    isKg && product.minQuantity && product.minQuantity > 0 ? product.minQuantity : isKg ? 1 : 1
  const step = isKg ? Math.min(0.25, minQuantity) : 1
  const avgUnitWeight = product.avgUnitWeight && product.unitType === 'unidad' ? product.avgUnitWeight : null

  return (
    <div className="quick-add-modal-overlay" onClick={onClose}>
      <div
        className="quick-add-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón cerrar (cruz) */}
        <button className="quick-add-modal-close" onClick={onClose} aria-label="Cerrar">
          <HiX className="quick-add-modal-close-icon" />
        </button>

        {/* Contenido del modal */}
        <div className="quick-add-modal-content">
          <h3 className="quick-add-modal-title">{product.name}</h3>
          {avgUnitWeight ? (
            <p className="quick-add-modal-subinfo">Peso promedio por unidad: {avgUnitWeight} kg</p>
          ) : null}

          {/* Selección de cantidad */}
          <div className="quick-add-modal-section">
            <label className="quick-add-modal-label">
              Cantidad ({unitType === 'kg' ? 'kg' : 'unidades'})
            </label>
            <div className="quick-add-modal-quantity">
              <button
                className="quick-add-modal-quantity-btn"
                onClick={() =>
                  setQuantity(prev => {
                    const newValue = prev - step
                    return Math.max(minQuantity, parseFloat(newValue.toFixed(2)))
                  })
                }
              >
                −
              </button>
              <input
                type="number"
                className="quick-add-modal-quantity-input"
                value={quantity}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0
                  setQuantity(Math.max(minQuantity, value))
                }}
                min={minQuantity}
                step={step}
              />
              <button
                className="quick-add-modal-quantity-btn"
                onClick={() =>
                  setQuantity(prev => parseFloat((prev + step).toFixed(2)))
                }
              >
                +
              </button>
            </div>
          </div>

          {/* Opciones de corte */}
          {cutOptions.length > 0 && (
            <div className="quick-add-modal-section">
              <label className="quick-add-modal-label">¿Cómo lo querés recibir?</label>
              <div className="quick-add-modal-cuts">
                {cutOptions.map((cut) => (
                  <button
                    key={cut}
                    className={`quick-add-modal-cut-option ${selectedCut === cut ? 'active' : ''}`}
                    onClick={() => setSelectedCut(selectedCut === cut ? '' : cut)}
                  >
                    {cut}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Botón agregar */}
          <button
            className="quick-add-modal-add-btn"
            onClick={handleAddToCart}
          >
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  )
}

