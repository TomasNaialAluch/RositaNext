'use client'

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '@/lib/firebase'

export interface CartItem {
  id: string // ID único del item en el carrito
  productId: string
  name: string
  price: number
  quantity: number
  unitType: 'kg' | 'unidad'
  cutOption?: string
  image?: string
  avgUnitWeight?: number | null
}

export interface CartContextType {
  showCart: boolean
  cartOpen: boolean
  toggleCart: () => void
  setShowCart: (show: boolean) => void
  openCart: () => void
  closeCart: () => void
  cartTotal: number
  cartItems: CartItem[]
  cartItemsCount: number
  triggerAddToCartAnimation: () => void
  addToCart: (item: Omit<CartItem, 'id'>) => void
  removeFromCart: (itemId: string) => void
  updateCartItemQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
}

const CART_STORAGE_KEY = 'rosita_cart'

export const CartContext = createContext<CartContextType | undefined>(undefined)

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartContext.Provider')
  }
  return context
}

// Función helper para generar ID único
const generateCartItemId = (productId: string, unitType: 'kg' | 'unidad', cutOption?: string): string => {
  return `${productId}_${unitType}_${cutOption || 'default'}`
}

// Función helper para cargar carrito desde localStorage
const loadCartFromStorage = (): CartItem[] => {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Error loading cart from storage:', error)
  }
  return []
}

// Función helper para guardar carrito en localStorage
const saveCartToStorage = (items: CartItem[]): void => {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  } catch (error) {
    console.error('Error saving cart to storage:', error)
  }
}

// Provider Component
interface CartProviderProps {
  children: React.ReactNode
  value?: Partial<CartContextType>
}

export function CartProvider({ children, value }: CartProviderProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [showAddAnimation, setShowAddAnimation] = useState(false)
  const [user, setUser] = useState<any>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isInitialLoadRef = useRef(true)
  const hasLoadedFromFirebaseRef = useRef(false)
  const isLoadingFromFirebaseRef = useRef(false)

  // Detectar usuario autenticado
  useEffect(() => {
    if (!auth) return
    
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })
    
    return () => unsubscribe()
  }, [])

  // Cargar carrito desde localStorage al montar (primero)
  useEffect(() => {
    const loadedItems = loadCartFromStorage()
    if (loadedItems.length > 0) {
      setCartItems(loadedItems)
    }
  }, [])

  // Cargar carrito desde Firebase cuando el usuario se autentica
  useEffect(() => {
    if (!user || !db || hasLoadedFromFirebaseRef.current) return

    const loadCartFromFirebase = async () => {
      isLoadingFromFirebaseRef.current = true
      try {
        const cartRef = doc(db, 'carts', user.uid)
        const cartDoc = await getDoc(cartRef)
        
        const localItems = loadCartFromStorage()
        const localUpdatedAtStr = localStorage.getItem(`${CART_STORAGE_KEY}_updated`)
        const localUpdatedAt = localUpdatedAtStr ? new Date(localUpdatedAtStr) : new Date(0)
        
        if (cartDoc.exists()) {
          const firebaseCart = cartDoc.data()
          const firebaseItems = firebaseCart.items || []
          
          // Convertir timestamp de Firestore a Date
          let firebaseUpdatedAt = new Date(0)
          if (firebaseCart.updatedAt) {
            if (firebaseCart.updatedAt.toDate) {
              firebaseUpdatedAt = firebaseCart.updatedAt.toDate()
            } else if (firebaseCart.updatedAt instanceof Date) {
              firebaseUpdatedAt = firebaseCart.updatedAt
            } else if (firebaseCart.updatedAt.seconds) {
              firebaseUpdatedAt = new Date(firebaseCart.updatedAt.seconds * 1000)
            }
          }
          
          console.log('Cart sync - Local:', localItems.length, 'items, updated:', localUpdatedAt)
          console.log('Cart sync - Firebase:', firebaseItems.length, 'items, updated:', firebaseUpdatedAt)
          
          // Comparar timestamps y usar el más reciente
          if (firebaseUpdatedAt.getTime() > localUpdatedAt.getTime()) {
            // Firebase es más reciente
            if (firebaseItems.length > 0) {
              setCartItems(firebaseItems)
              saveCartToStorage(firebaseItems)
              localStorage.setItem(`${CART_STORAGE_KEY}_updated`, firebaseUpdatedAt.toISOString())
              console.log('Cart loaded from Firebase (newer)')
            } else {
              // Firebase está vacío y es más reciente, limpiar local también
              setCartItems([])
              saveCartToStorage([])
              localStorage.setItem(`${CART_STORAGE_KEY}_updated`, firebaseUpdatedAt.toISOString())
              console.log('Cart cleared (Firebase is newer and empty)')
            }
          } else if (localUpdatedAt.getTime() > firebaseUpdatedAt.getTime()) {
            // LocalStorage es más reciente
            if (localItems.length > 0) {
              setCartItems(localItems)
              console.log('Cart loaded from localStorage (newer)')
              // Sincronizar a Firebase (se hará automáticamente con el useEffect de guardado)
            } else {
              setCartItems([])
              console.log('Cart cleared (localStorage is newer and empty)')
            }
          } else {
            // Mismo timestamp, usar el que tenga más items o Firebase si tienen la misma cantidad
            if (firebaseItems.length >= localItems.length) {
              if (firebaseItems.length > 0) {
                setCartItems(firebaseItems)
                saveCartToStorage(firebaseItems)
                console.log('Cart loaded from Firebase (same timestamp, more items)')
              } else {
                setCartItems([])
                console.log('Cart cleared (both empty)')
              }
            } else {
              setCartItems(localItems)
              console.log('Cart loaded from localStorage (same timestamp, more items)')
            }
          }
        } else {
          // No existe carrito en Firebase, usar localStorage si tiene items
          if (localItems.length > 0) {
            setCartItems(localItems)
            console.log('Cart loaded from localStorage (no Firebase cart)')
          } else {
            setCartItems([])
            console.log('Cart empty (no Firebase cart, no local items)')
          }
        }
        
        hasLoadedFromFirebaseRef.current = true
        isInitialLoadRef.current = false
        isLoadingFromFirebaseRef.current = false
      } catch (error) {
        console.error('Error loading cart from Firebase:', error)
        // En caso de error, mantener el carrito local
        const localItems = loadCartFromStorage()
        if (localItems.length > 0) {
          setCartItems(localItems)
          console.log('Cart loaded from localStorage (Firebase error)')
        }
        hasLoadedFromFirebaseRef.current = true
        isInitialLoadRef.current = false
        isLoadingFromFirebaseRef.current = false
      }
    }

    loadCartFromFirebase()
  }, [user])

  // Si no hay usuario después de un tiempo, permitir guardados en localStorage
  useEffect(() => {
    if (!user && !hasLoadedFromFirebaseRef.current) {
      const timer = setTimeout(() => {
        isInitialLoadRef.current = false
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [user])

  // Guardar carrito en localStorage cuando cambie (inmediato)
  useEffect(() => {
    // No guardar durante la carga inicial o durante la carga desde Firebase
    if (isInitialLoadRef.current || isLoadingFromFirebaseRef.current) return
    
    saveCartToStorage(cartItems)
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${CART_STORAGE_KEY}_updated`, new Date().toISOString())
    }
  }, [cartItems])

  // Guardar carrito en Firebase con debounce (cada 2 segundos después del último cambio)
  useEffect(() => {
    // No guardar durante la carga inicial
    if (isInitialLoadRef.current) return
    
    if (!user || !db) {
      // Si no hay usuario, limpiar timeout si existe
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
        saveTimeoutRef.current = null
      }
      return
    }

    // Limpiar timeout anterior
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Crear nuevo timeout para guardar en Firebase
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const cartRef = doc(db, 'carts', user.uid)
        
        // Limpiar campos undefined de los items antes de guardar
        const cleanedItems = cartItems.map(item => {
          const cleaned: any = {
            id: item.id,
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            unitType: item.unitType
          }
          
          // Solo incluir campos opcionales si tienen valor (no undefined)
          if (item.cutOption !== undefined && item.cutOption !== null && item.cutOption !== '') {
            cleaned.cutOption = item.cutOption
          }
          if (item.image !== undefined && item.image !== null && item.image !== '') {
            cleaned.image = item.image
          }
          if (item.avgUnitWeight !== undefined && item.avgUnitWeight !== null) {
            cleaned.avgUnitWeight = item.avgUnitWeight
          }
          
          return cleaned
        })
        
        const cartData: any = {
          items: cleanedItems,
          updatedAt: serverTimestamp()
        }
        
        await setDoc(cartRef, cartData, { merge: true })
        console.log('Cart saved to Firebase:', cleanedItems.length, 'items')
      } catch (error) {
        console.error('Error saving cart to Firebase:', error)
      }
      saveTimeoutRef.current = null
    }, 2000) // Esperar 2 segundos después del último cambio

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
        saveTimeoutRef.current = null
      }
    }
  }, [cartItems, user])

  // Calcular total del carrito
  const cartTotal = cartItems.reduce((total, item) => {
    return total + (item.price * item.quantity)
  }, 0)

  // Contar items del carrito
  const cartItemsCount = cartItems.reduce((count, item) => {
    return count + item.quantity
  }, 0)

  // Agregar al carrito
  const addToCart = useCallback((item: Omit<CartItem, 'id'>) => {
    const itemId = generateCartItemId(item.productId, item.unitType, item.cutOption)
    
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(i => i.id === itemId)
      
      if (existingItemIndex >= 0) {
        // Si ya existe, actualizar cantidad
        const updatedItems = [...prevItems]
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + item.quantity
        }
        return updatedItems
      } else {
        // Si no existe, agregar nuevo item
        return [...prevItems, { ...item, id: itemId }]
      }
    })
  }, [])

  // Eliminar del carrito
  const removeFromCart = useCallback((itemId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId))
  }, [])

  // Actualizar cantidad de un item
  const updateCartItemQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId)
      return
    }
    
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    )
  }, [removeFromCart])

  // Limpiar carrito (solo cuando se confirma pedido o usuario lo vacía)
  const clearCart = useCallback(async () => {
    setCartItems([])
    saveCartToStorage([])
    
    // Limpiar timeout de guardado pendiente
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = null
    }
    
    // También limpiar en Firebase si hay usuario
    if (user && db) {
      try {
        const cartRef = doc(db, 'carts', user.uid)
        await setDoc(cartRef, {
          items: [],
          updatedAt: serverTimestamp()
        }, { merge: true })
      } catch (error) {
        console.error('Error clearing cart in Firebase:', error)
      }
    }
  }, [user])

  // Funciones de UI del carrito
  const toggleCart = useCallback(() => {
    setShowCart(prev => !prev)
  }, [])

  const openCart = useCallback(() => {
    setCartOpen(true)
    setShowCart(true)
  }, [])

  const closeCart = useCallback(() => {
    setCartOpen(false)
    setShowCart(false)
  }, [])

  const triggerAddToCartAnimation = useCallback(() => {
    setShowCart(true)
    setShowAddAnimation(true)
    
    setTimeout(() => {
      setShowCart(false)
      setShowAddAnimation(false)
    }, 2000)
  }, [])

  const contextValue: CartContextType = {
    showCart,
    cartOpen,
    toggleCart,
    setShowCart,
    openCart,
    closeCart,
    cartTotal,
    cartItems,
    cartItemsCount,
    triggerAddToCartAnimation,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    ...value // Permitir override de valores desde props
  }

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  )
}


