'use client'

import { CartProvider } from '@/contexts/CartContext'

interface CartProviderWrapperProps {
  children: React.ReactNode
}

export default function CartProviderWrapper({ children }: CartProviderWrapperProps) {
  return <CartProvider>{children}</CartProvider>
}



