import { useState, useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Product } from '@/components/admin/types'

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchProducts = async () => {
    if (!db) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const productsRef = collection(db, 'products')
      
      // Obtener todos los productos sin ordenar (más confiable)
      const querySnapshot = await getDocs(productsRef)
      
      const productsData: Product[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        productsData.push({
          id: doc.id,
          ...data
        } as Product)
      })
      
      // Ordenar productos en memoria: primero por 'order' si existe, luego los sin order al final
      const sorted = productsData.sort((a, b) => {
        const orderA = a.order !== undefined && a.order !== null ? a.order : 9999
        const orderB = b.order !== undefined && b.order !== null ? b.order : 9999
        return orderA - orderB
      })
      
      setProducts(sorted)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error al cargar productos')
      setError(error)
      console.error('Error al cargar productos:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  return { products, loading, error, refetch: fetchProducts }
}

