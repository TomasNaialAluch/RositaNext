'use client'

import { useState, useMemo } from 'react'
import { useProducts } from '@/hooks/useProducts'
import ProductEditModal from '../ProductEditModal'
import type { Product } from '../types'
import '@/styles/admin.css'

export default function ProductEditManagement() {
  const { products, loading, refetch } = useProducts()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products
    
    const queryLower = searchQuery.toLowerCase()
    return products.filter(product =>
      product.name.toLowerCase().includes(queryLower) ||
      product.description?.toLowerCase().includes(queryLower) ||
      product.category.toLowerCase().includes(queryLower)
    )
  }, [products, searchQuery])

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedProduct(null)
    refetch()
  }

  if (loading) {
    return (
      <div className="admin-section">
        <h2 className="admin-section-title">Editar Productos</h2>
        <div className="admin-loading">
          <p>Cargando productos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">Editar Productos</h2>
      
      {/* Buscador */}
      <div className="admin-search-container">
        <input
          type="text"
          className="admin-search-input"
          placeholder="Buscar productos por nombre, descripción o categoría..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Lista de productos */}
      {filteredProducts.length === 0 ? (
        <div className="admin-empty-state">
          <p>{searchQuery ? 'No se encontraron productos que coincidan con la búsqueda' : 'No hay productos disponibles'}</p>
        </div>
      ) : (
        <div className="admin-products-list">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="admin-product-item"
              onClick={() => handleProductClick(product)}
            >
              <div className="admin-product-item-image">
                {product.image ? (
                  <img src={product.image} alt={product.name} />
                ) : (
                  <div className="admin-product-item-no-image">
                    <span>Sin imagen</span>
                  </div>
                )}
              </div>
              <div className="admin-product-item-info">
                <h3>{product.name}</h3>
                <p className="admin-product-item-category">
                  Categoría: {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                </p>
                <p className="admin-product-item-price">
                  ${product.price.toFixed(2)} {product.unitType === 'kg' ? '/kg' : '/unidad'}
                </p>
                {product.description && (
                  <p className="admin-product-item-description">{product.description}</p>
                )}
              </div>
              <div className="admin-product-item-actions">
                <button className="admin-edit-btn" type="button">
                  Editar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de edición */}
      {selectedProduct && (
        <ProductEditModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={handleModalClose}
        />
      )}
    </div>
  )
}

