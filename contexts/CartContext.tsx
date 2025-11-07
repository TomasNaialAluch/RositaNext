'use client'

import { createContext, useContext } from 'react'

export interface CartContextType {
  showCart: boolean
  cartOpen: boolean
  toggleCart: () => void
  setShowCart: (show: boolean) => void
  openCart: () => void
  closeCart: () => void
  cartTotal: number
  triggerAddToCartAnimation: () => void
}

export const CartContext = createContext<CartContextType | undefined>(undefined)

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartContext.Provider')
  }
  return context
}


