'use client'

import { useEffect, useState, useMemo } from 'react'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useCart } from '@/contexts/CartContext'
import FilterChip from '@/components/shop/FilterChip'
import SearchInput from '@/components/shop/SearchInput'
import ProductCard from '@/components/shop/ProductCard'
import ProductModal from '@/components/shop/ProductModal'
import QuickAddModal from '@/components/shop/QuickAddModal'
import '@/styles/tienda.css'

interface Product {
  id: string
  name: string
  description?: string
  price: number
  image?: string
  category: 'vacuno' | 'cerdo' | 'pollo' | 'otros'
  preparation?: string[]
  unitType?: 'kg' | 'unidad'
  minQuantity?: number
  avgUnitWeight?: number | null
  [key: string]: any
}

export default function TiendaContent() {
  const { triggerAddToCartAnimation } = useCart()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedPreparation, setSelectedPreparation] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [isQuickAddModalOpen, setIsQuickAddModalOpen] = useState(false)

  // Categorías principales
  const mainCategories = ['vacuno', 'cerdo', 'pollo', 'otros']
  
  // Preparaciones
  const preparations = ['parrilla', 'milanesa', 'horno', 'guiso', 'asado', 'plancha']

  useEffect(() => {
    const fetchProducts = async () => {
      if (!db) {
        setLoading(false)
        return
      }

      try {
        const productsRef = collection(db, 'products')
        const q = query(productsRef, orderBy('created_at', 'desc'))
        const querySnapshot = await getDocs(q)
        
        const productsData: Product[] = []
        querySnapshot.forEach((doc) => {
          productsData.push({
            id: doc.id,
            ...doc.data()
          } as Product)
        })
        
        setProducts(productsData)
      } catch (error) {
        console.error('Error al cargar productos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Optimización: usar useMemo para filtrar productos (DRY + Performance)
  const filteredProducts = useMemo(() => {
    let filtered = [...products]

    // Filtrar por categoría
    if (selectedCategory) {
      filtered = filtered.filter(product => 
        product.category === selectedCategory
      )
    }

    // Filtrar por preparación
    if (selectedPreparation) {
      filtered = filtered.filter(product => {
        if (Array.isArray(product.preparation)) {
          return product.preparation.includes(selectedPreparation)
        }
        if (typeof product.preparation === 'string') {
          return product.preparation === selectedPreparation
        }
        return product[selectedPreparation] !== undefined
      })
    }

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const queryLower = searchQuery.toLowerCase()
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(queryLower) ||
        product.description?.toLowerCase().includes(queryLower)
      )
    }

    return filtered
  }, [products, selectedCategory, selectedPreparation, searchQuery])

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(selectedCategory === category ? null : category)
  }

  const handlePreparationClick = (preparation: string) => {
    setSelectedPreparation(selectedPreparation === preparation ? null : preparation)
  }

  const handleCardClick = (product: Product) => {
    setSelectedProduct(product)
    setIsProductModalOpen(true)
  }

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedProduct(product)
    setIsQuickAddModalOpen(true)
  }

  const handleAddToCart = (data: {
    productId: string
    quantity: number
    unitType: 'kg' | 'unidad'
    cutOption?: string
  }) => {
    // TODO: Implementar lógica de agregar al carrito
    console.log('Agregar al carrito:', data)
    // Aquí se puede integrar con el contexto del carrito
    
    // Disparar la animación visual
    triggerAddToCartAnimation()
  }

  if (loading) {
    return (
      <div className="tienda-loading">
        <p>Cargando productos...</p>
      </div>
    )
  }

  return (
    <div className="tienda-content">
      {/* Chips de categorías principales */}
      <div className="tienda-filters-group">
        <p className="tienda-filters-label">Categorías principales</p>
        <div className="tienda-filters-main">
          {mainCategories.map((category) => (
            <FilterChip
              key={category}
              label={category.charAt(0).toUpperCase() + category.slice(1)}
              active={selectedCategory === category}
              onClick={() => handleCategoryClick(category)}
              size="large"
            />
          ))}
        </div>
      </div>

      {/* Chips de preparación */}
      <div className="tienda-filters-group">
        <p className="tienda-filters-label">Métodos de preparación</p>
        <div className="tienda-filters-secondary">
          {preparations.map((preparation) => (
            <FilterChip
              key={preparation}
              label={preparation.charAt(0).toUpperCase() + preparation.slice(1)}
              active={selectedPreparation === preparation}
              onClick={() => handlePreparationClick(preparation)}
              size="small"
            />
          ))}
        </div>
      </div>

      {/* Input de búsqueda */}
      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Buscar productos..."
      />

      {/* Grid de productos */}
      {filteredProducts.length === 0 ? (
        <div className="tienda-empty">
          <p className="tienda-empty-text">No se encontraron productos</p>
          {(selectedCategory || selectedPreparation || searchQuery) && (
            <button
              className="tienda-empty-button"
              onClick={() => {
                setSelectedCategory(null)
                setSelectedPreparation(null)
                setSearchQuery('')
              }}
            >
              Limpiar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="tienda-products-grid">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              description={product.description}
              price={product.price}
            unitType={product.unitType}
            avgUnitWeight={product.avgUnitWeight}
              image={product.image}
              onCardClick={() => handleCardClick(product)}
              onAddToCart={(e) => handleQuickAdd(product, e)}
            />
          ))}
        </div>
      )}

      {/* Modal completo del producto */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          isOpen={isProductModalOpen}
          onClose={() => {
            setIsProductModalOpen(false)
            setSelectedProduct(null)
          }}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Modal rápido de agregar */}
      {selectedProduct && (
        <QuickAddModal
          product={selectedProduct}
          isOpen={isQuickAddModalOpen}
          onClose={() => {
            setIsQuickAddModalOpen(false)
            setSelectedProduct(null)
          }}
          onAddToCart={handleAddToCart}
        />
      )}
    </div>
  )
}

