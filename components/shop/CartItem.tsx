'use client'

import Image from 'next/image'
import { HiTrash, HiMinus, HiPlus } from 'react-icons/hi2'
import { useCart } from '@/contexts/CartContext'
import type { CartItem as CartItemType } from '@/contexts/CartContext'
import '@/styles/tienda.css'

interface CartItemProps {
  item: CartItemType
}

export default function CartItem({ item }: CartItemProps) {
  const { updateCartItemQuantity, removeFromCart } = useCart()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price)
  }

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(item.id)
    } else {
      updateCartItemQuantity(item.id, newQuantity)
    }
  }

  const handleDecrease = () => {
    const step = item.unitType === 'kg' ? 0.25 : 1
    handleQuantityChange(item.quantity - step)
  }

  const handleIncrease = () => {
    const step = item.unitType === 'kg' ? 0.25 : 1
    handleQuantityChange(item.quantity + step)
  }

  const itemTotal = item.price * item.quantity

  return (
    <div className="cart-item">
      {/* Parte superior */}
      <div className="cart-item-top">
        {/* Imagen del producto */}
        <div className="cart-item-image">
          {item.image ? (
            <Image
              src={item.image}
              alt={item.name}
              width={60}
              height={60}
              className="cart-item-image-img"
              unoptimized
            />
          ) : (
            <div className="cart-item-image-placeholder">
              <span>Sin imagen</span>
            </div>
          )}
        </div>

        {/* Información del producto */}
        <div className="cart-item-info">
          <h3 className="cart-item-name">{item.name}</h3>
          <p className="cart-item-quantity-label">
            {item.quantity} {item.unitType === 'kg' ? 'kg' : 'unidad'}
          </p>
        </div>

        {/* Botón eliminar */}
        <button
          className="cart-item-remove"
          onClick={() => removeFromCart(item.id)}
          aria-label="Eliminar del carrito"
        >
          <HiTrash />
        </button>
      </div>

      {/* Parte inferior */}
      <div className="cart-item-bottom">
        {/* Precio */}
        <div className="cart-item-total">
          {formatPrice(itemTotal)}
        </div>

        {/* Botonera de cantidad */}
        <div className="cart-item-quantity">
          <button
            className="cart-item-quantity-btn"
            onClick={handleDecrease}
            aria-label="Disminuir cantidad"
          >
            <HiMinus />
          </button>
          <span className="cart-item-quantity-value">
            {item.quantity} {item.unitType === 'kg' ? 'kg' : 'un'}
          </span>
          <button
            className="cart-item-quantity-btn"
            onClick={handleIncrease}
            aria-label="Aumentar cantidad"
          >
            <HiPlus />
          </button>
        </div>
      </div>
    </div>
  )
}

