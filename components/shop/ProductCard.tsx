'use client'

import Image from 'next/image'
import { HiPlus } from 'react-icons/hi2'
import '@/styles/tienda.css'

interface ProductCardProps {
  id: string
  name: string
  description?: string
  price: number
  unitType?: 'kg' | 'unidad'
  avgUnitWeight?: number | null
  image?: string
  onCardClick: () => void
  onAddToCart: (e: React.MouseEvent) => void
}

export default function ProductCard({ id, name, description, price, unitType = 'kg', avgUnitWeight, image, onCardClick, onAddToCart }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price)
  }

  return (
    <div className="product-card" onClick={onCardClick}>
      {image ? (
        <div className="product-card-image-container">
          <Image
            src={image}
            alt={name}
            width={300}
            height={300}
            className="product-card-image"
            unoptimized
          />
        </div>
      ) : (
        <div className="product-card-image-placeholder">
          <span className="product-card-image-placeholder-text">Sin imagen</span>
        </div>
      )}
      
      <div className="product-card-content">
        <h3 className="product-card-name">{name}</h3>
        {description && (
          <p className="product-card-description">{description}</p>
        )}
        <div className="product-card-footer">
          <div className="product-card-price-wrapper">
            <span className="product-card-price">
              {formatPrice(price)} {unitType === 'kg' ? '/ kg' : '/ unidad'}
            </span>
            {unitType === 'unidad' && avgUnitWeight ? (
              <span className="product-card-subinfo">Peso promedio: {avgUnitWeight} kg</span>
            ) : null}
          </div>
          <button
            className="product-card-add-button"
            onClick={(e) => {
              e.stopPropagation()
              onAddToCart(e)
            }}
            aria-label={`Agregar ${name} al carrito`}
          >
            <HiPlus className="product-card-add-icon" />
          </button>
        </div>
      </div>
    </div>
  )
}

