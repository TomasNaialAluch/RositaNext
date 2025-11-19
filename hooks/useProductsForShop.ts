import { useState, useEffect, useMemo } from 'react'
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import type { Product } from '@/components/admin/types'

interface OrderItem {
  productId: string
  quantity: number
}

export function useProductsForShop() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [userOrderCounts, setUserOrderCounts] = useState<Record<string, number>>({})

  // Obtener productos más comprados por el usuario
  useEffect(() => {
    const fetchUserOrderCounts = async () => {
      const user = auth.currentUser
      if (!user || !db) return

      try {
        // Buscar pedidos del usuario
        const ordersRef = collection(db, 'orders')
        const userOrdersQuery = query(ordersRef, where('userId', '==', user.uid))
        const ordersSnapshot = await getDocs(userOrdersQuery)

        const counts: Record<string, number> = {}
        
        ordersSnapshot.forEach((orderDoc) => {
          const orderData = orderDoc.data()
          if (orderData.items && Array.isArray(orderData.items)) {
            orderData.items.forEach((item: OrderItem) => {
              if (item.productId) {
                counts[item.productId] = (counts[item.productId] || 0) + item.quantity
              }
            })
          }
        })

        setUserOrderCounts(counts)
      } catch (err) {
        console.error('Error al cargar historial de pedidos:', err)
      }
    }

    fetchUserOrderCounts()
  }, [])

  // Obtener productos
  useEffect(() => {
    const fetchProducts = async () => {
      if (!db) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const productsRef = collection(db, 'products')
        
        // Obtener todos los productos sin ordenar primero
        const querySnapshot = await getDocs(productsRef)
        
        const productsData: Product[] = []
        querySnapshot.forEach((doc) => {
          productsData.push({
            id: doc.id,
            ...doc.data()
          } as Product)
        })
        
        setProducts(productsData)
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Error al cargar productos')
        setError(error)
        console.error('Error al cargar productos:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Ordenar productos: primero los más comprados por el usuario, luego por orden del admin
  const sortedProducts = useMemo(() => {
    if (products.length === 0) return []

    const sorted = [...products].sort((a, b) => {
      const countA = userOrderCounts[a.id] || 0
      const countB = userOrderCounts[b.id] || 0

      // Si ambos tienen pedidos, ordenar por cantidad (mayor primero)
      if (countA > 0 && countB > 0) {
        return countB - countA
      }

      // Si solo uno tiene pedidos, ese va primero
      if (countA > 0) return -1
      if (countB > 0) return 1

      // Si ninguno tiene pedidos, usar el orden del admin
      // Productos con order definido primero, luego los sin order
      const orderA = a.order !== undefined ? a.order : 9999
      const orderB = b.order !== undefined ? b.order : 9999
      
      if (orderA !== orderB) {
        return orderA - orderB
      }
      
      // Si tienen el mismo order o ambos son 9999, mantener orden original
      return 0
    })

    return sorted
  }, [products, userOrderCounts])

  return { products: sortedProducts, loading, error }
}

