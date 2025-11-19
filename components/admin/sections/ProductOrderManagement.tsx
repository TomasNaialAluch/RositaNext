'use client'

import { useState, useEffect } from 'react'
import { useProducts } from '@/hooks/useProducts'
import { db } from '@/lib/firebase'
import { doc, updateDoc, writeBatch } from 'firebase/firestore'
import type { Product } from '../types'
import '@/styles/admin.css'

export default function ProductOrderManagement() {
  const { products, loading, error, refetch } = useProducts()
  const [orderedProducts, setOrderedProducts] = useState<Product[]>([])
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (products.length > 0) {
      // Ordenar productos por el campo 'order' si existe, sino por fecha de creación
      const sorted = [...products].sort((a, b) => {
        const orderA = a.order ?? 9999
        const orderB = b.order ?? 9999
        return orderA - orderB
      })
      setOrderedProducts(sorted)
    } else {
      // Si no hay productos, asegurarse de que orderedProducts esté vacío
      setOrderedProducts([])
    }
  }, [products])

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', '')
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'move'

    if (draggedIndex === null || draggedIndex === index) return

    const newOrdered = [...orderedProducts]
    const draggedItem = newOrdered[draggedIndex]

    // Remover el item arrastrado
    newOrdered.splice(draggedIndex, 1)
    // Insertar en la nueva posición
    const insertIndex = draggedIndex < index ? index - 1 : index
    newOrdered.splice(insertIndex, 0, draggedItem)

    setOrderedProducts(newOrdered)
    setDraggedIndex(insertIndex)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDraggedIndex(null)
  }

  const handleSaveOrder = async () => {
    setSaving(true)
    setSuccess(false)

    try {
      const batch = writeBatch(db)

      orderedProducts.forEach((product, index) => {
        const productRef = doc(db, 'products', product.id)
        batch.update(productRef, { order: index })
      })

      await batch.commit()
      
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        refetch()
      }, 2000)
    } catch (error: any) {
      console.error('Error al guardar orden:', error)
      alert('Error al guardar el orden: ' + (error.message || 'Error desconocido'))
    } finally {
      setSaving(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price)
  }

  if (loading) {
    return (
      <div className="admin-section">
        <h2 className="admin-section-title">Orden de Productos</h2>
        <div className="admin-loading">
          <p>Cargando productos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="admin-section">
        <h2 className="admin-section-title">Orden de Productos</h2>
        <div className="admin-error">
          <p>Error al cargar productos: {error.message}</p>
          <button onClick={refetch} className="admin-submit-btn" style={{ marginTop: '1rem' }}>
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  if (orderedProducts.length === 0 && !loading) {
    return (
      <div className="admin-section">
        <h2 className="admin-section-title">Orden de Productos</h2>
        <div className="admin-empty-state">
          <p>No hay productos disponibles para ordenar.</p>
          <p>Agrega productos primero desde la sección "Agregar Productos".</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">Orden de Productos</h2>
      <p className="admin-section-description">
        Arrastra los productos para ordenarlos. El orden que establezcas aquí será el orden por defecto en la tienda.
      </p>

      {success && (
        <div className="admin-success">
          ✓ Orden guardado exitosamente
        </div>
      )}

      <div className="admin-order-list">
        {orderedProducts.map((product, index) => (
          <div
            key={product.id}
            className={`admin-order-item ${draggedIndex === index ? 'dragging' : ''}`}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            onDrop={handleDrop}
          >
            <div className="admin-order-item-handle">
              <span>☰</span>
            </div>
            <div className="admin-order-item-content">
              <h3>{product.name}</h3>
              <p className="admin-order-item-price">
                {formatPrice(product.price)} {product.unitType === 'kg' ? '/kg' : '/unidad'}
              </p>
            </div>
            <div className="admin-order-item-position">
              #{index + 1}
            </div>
          </div>
        ))}
      </div>

      <div className="admin-order-actions">
        <button
          className="admin-submit-btn"
          onClick={handleSaveOrder}
          disabled={saving}
        >
          {saving ? 'Guardando...' : 'Guardar Orden'}
        </button>
      </div>
    </div>
  )
}

